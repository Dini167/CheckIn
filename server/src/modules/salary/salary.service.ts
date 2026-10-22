import type { PayrollSnapshot } from '@prisma/client';
import type { AuthUser } from '../../common/auth';
import { addMonths, currentMonthKey, dateKey, monthRange, parseMonthKey, toMonthKey } from '../../common/dates';
import { badRequest, conflict, notFound } from '../../common/errors';
import { prisma } from '../../common/prisma';
import { getSessions } from '../../common/worktime';
import { calculatePay, leaderBonus, type PaySummary } from './salary.calculator';

interface PayUser {
  id: number;
  name: string;
  role: 'EMPLOYEE' | 'TEAM_LEADER';
  hourlyRate: { toNumber(): number } | null;
}

const rateOf = (u: PayUser) => (u.hourlyRate === null ? null : u.hourlyRate.toNumber());

function fromSnapshot(s: PayrollSnapshot): PaySummary {
  const n = (d: { toNumber(): number }) => d.toNumber();
  const hourlyRate = s.hourlyRate === null ? null : n(s.hourlyRate);
  const missing = hourlyRate === null;
  return {
    salary: hourlyRate,
    salaryMissing: missing,
    workedDays: 0,
    regularHours: n(s.regularHours),
    overtimeHours: n(s.overtimeHours),
    basePay: missing ? null : n(s.basePay),
    overtimePay: missing ? null : n(s.overtimePay),
    bonus: missing ? null : n(s.bonus),
    total: missing ? null : n(s.total),
  };
}

async function teamMembers(teamId: number | null): Promise<PayUser[]> {
  return prisma.user.findMany({
    where: { teamId: teamId ?? -1 },
    select: { id: true, name: true, role: true, hourlyRate: true },
    orderBy: { name: 'asc' },
  });
}

/** Live (unlocked) pay for every member of a team, including the leader's bonus. */
async function computeTeam(teamId: number | null, monthKey: string) {
  const members = await teamMembers(teamId);
  const { from, to } = monthRange(monthKey);
  const sessions = await getSessions(
    members.map((m) => m.id),
    from,
    to,
  );
  const sessionsOf = (id: number) => sessions.filter((s) => s.userId === id);

  const employees = members.filter((m) => m.role === 'EMPLOYEE');
  const employeePay = new Map(employees.map((m) => [m.id, calculatePay(sessionsOf(m.id), rateOf(m))]));
  const bonus = leaderBonus([...employeePay.values()].map((p) => p.total));

  return members.map((m) => ({
    user: m,
    pay: m.role === 'TEAM_LEADER' ? calculatePay(sessionsOf(m.id), rateOf(m), bonus) : employeePay.get(m.id)!,
  }));
}

async function isLocked(teamId: number | null, monthKey: string) {
  if (teamId === null) return false;
  const { year, month } = parseMonthKey(monthKey);
  return (await prisma.monthLock.findUnique({ where: { teamId_year_month: { teamId, year, month } } })) !== null;
}

async function payForUser(user: AuthUser, monthKey: string): Promise<PaySummary & { isLocked: boolean }> {
  const { year, month } = parseMonthKey(monthKey);
  if (await isLocked(user.teamId, monthKey)) {
    const snapshot = await prisma.payrollSnapshot.findUnique({
      where: { userId_year_month: { userId: user.id, year, month } },
    });
    if (snapshot) return { ...fromSnapshot(snapshot), isLocked: true };
  }

  if (user.role === 'TEAM_LEADER') {
    const team = await computeTeam(user.teamId, monthKey);
    return { ...team.find((t) => t.user.id === user.id)!.pay, isLocked: false };
  }

  const me = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { id: true, name: true, role: true, hourlyRate: true },
  });
  const { from, to } = monthRange(monthKey);
  return { ...calculatePay(await getSessions(user.id, from, to), rateOf(me)), isLocked: false };
}

export async function getMySalary(user: AuthUser, monthKey = currentMonthKey()) {
  const pay = await payForUser(user, monthKey);
  return { month: monthKey, ...pay, isCurrentMonth: monthKey === currentMonthKey() };
}

export async function getMyHistory(user: AuthUser) {
  const me = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { createdAt: true } });
  const firstSession = await prisma.attendanceSession.findFirst({
    where: { userId: user.id },
    orderBy: { workDate: 'asc' },
    select: { workDate: true },
  });
  const startDate = firstSession && firstSession.workDate < me.createdAt ? firstSession.workDate : me.createdAt;
  const first = dateKey(startDate).slice(0, 7);

  const months: string[] = [];
  for (let m = currentMonthKey(); m >= first && months.length < 24; m = addMonths(m, -1)) months.push(m);

  const history = [];
  for (const m of months) history.push(await getMySalary(user, m));
  return history;
}

export async function getTeamPayroll(leader: AuthUser, monthKey = currentMonthKey()) {
  const locked = await isLocked(leader.teamId, monthKey);
  let rows: { user: PayUser; pay: PaySummary }[];

  if (locked) {
    const { year, month } = parseMonthKey(monthKey);
    const members = await teamMembers(leader.teamId);
    const snapshots = await prisma.payrollSnapshot.findMany({ where: { teamId: leader.teamId!, year, month } });
    rows = members.flatMap((m) => {
      const snap = snapshots.find((s) => s.userId === m.id);
      return snap ? [{ user: m, pay: fromSnapshot(snap) }] : [];
    });
  } else {
    rows = await computeTeam(leader.teamId, monthKey);
  }

  const employeesTotal = rows
    .filter((r) => r.user.role === 'EMPLOYEE')
    .reduce((sum, r) => sum + (r.pay.total ?? 0), 0);
  const leaderRow = rows.find((r) => r.user.id === leader.id);
  const teamTotal = rows.reduce((sum, r) => sum + (r.pay.total ?? 0), 0);

  return {
    month: monthKey,
    isLocked: locked,
    members: rows.map((r) => ({
      month: monthKey,
      user: { id: r.user.id, name: r.user.name },
      role: r.user.role,
      ...r.pay,
      isLocked: locked,
      isCurrentMonth: monthKey === currentMonthKey(),
    })),
    employeesTotal: Math.round(employeesTotal * 100) / 100,
    leaderBonus: leaderRow?.pay.bonus ?? 0,
    teamTotal: Math.round(teamTotal * 100) / 100,
    membersMissingSalary: rows.filter((r) => r.pay.salaryMissing).length,
  };
}

export async function lockMonth(leader: AuthUser, monthKey: string) {
  if (leader.teamId === null) throw notFound('אינך משויך/ת לצוות');
  if (monthKey >= currentMonthKey()) throw badRequest('אפשר לנעול רק חודש שהסתיים', 'MONTH_NOT_ENDED');
  if (await isLocked(leader.teamId, monthKey)) throw conflict('החודש כבר נעול', 'ALREADY_LOCKED');

  const { year, month } = parseMonthKey(monthKey);
  const rows = await computeTeam(leader.teamId, monthKey);
  const teamId = leader.teamId;

  await prisma.$transaction([
    prisma.monthLock.create({ data: { teamId, year, month, lockedById: leader.id } }),
    ...rows.map((r) =>
      prisma.payrollSnapshot.create({
        data: {
          userId: r.user.id,
          teamId,
          year,
          month,
          hourlyRate: r.pay.salary,
          regularHours: r.pay.regularHours,
          overtimeHours: r.pay.overtimeHours,
          basePay: r.pay.basePay ?? 0,
          overtimePay: r.pay.overtimePay ?? 0,
          bonus: r.pay.bonus ?? 0,
          total: r.pay.total ?? 0,
        },
      }),
    ),
  ]);

  return getTeamPayroll(leader, monthKey);
}

export async function listLocks(leader: AuthUser) {
  const locks = await prisma.monthLock.findMany({
    where: { teamId: leader.teamId ?? -1 },
    include: { lockedBy: { select: { id: true, name: true } } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });
  return locks.map((l) => ({
    month: toMonthKey(l.year, l.month),
    lockedAt: l.lockedAt.toISOString(),
    lockedBy: l.lockedBy,
  }));
}
