import type { AttendanceSession, WorkLocation } from '@prisma/client';
import type { AuthUser } from '../../common/auth';
import { now } from '../../common/clock';
import { addDays, currentMonthKey, keyToDb, monthRange, todayKey } from '../../common/dates';
import { badRequest, conflict } from '../../common/errors';
import { emit } from '../../common/events';
import { prisma } from '../../common/prisma';
import { liveSessionMinutes } from '../../common/worktime';
import { describeDays, loadDayContext } from './attendance.days';
import { toSessionDto } from './attendance.mapper';
import type { z } from '../../common/zod';
import type { teamAttendanceQuerySchema } from './attendance.schemas';

type DayState = 'NOT_STARTED' | 'IN' | 'PAUSED' | 'ENDED';

function stateOf(sessions: AttendanceSession[]): { state: DayState; current: AttendanceSession | null } {
  const open = sessions.find((s) => s.clockOut === null) ?? null;
  if (open) return { state: 'IN', current: open };
  const last = sessions[sessions.length - 1];
  if (!last) return { state: 'NOT_STARTED', current: null };
  return { state: last.endType === 'PAUSE' ? 'PAUSED' : 'ENDED', current: null };
}

async function todaySessions(userId: number) {
  return prisma.attendanceSession.findMany({
    where: { userId, workDate: keyToDb(todayKey()) },
    orderBy: { clockIn: 'asc' },
  });
}

export async function getToday(user: AuthUser) {
  const sessions = await todaySessions(user.id);
  const { state, current } = stateOf(sessions);
  return {
    date: todayKey(),
    state,
    workedMinutes: sessions.reduce((sum, s) => sum + liveSessionMinutes(s), 0),
    currentSession: current ? toSessionDto(current) : null,
    sessions: sessions.map(toSessionDto),
  };
}

export async function clockIn(user: AuthUser, location: WorkLocation, remarks?: string) {
  const sessions = await todaySessions(user.id);
  if (sessions.some((s) => s.clockOut === null)) {
    throw conflict('את/ה כבר במשמרת — יש לצאת לפני כניסה חדשה', 'ALREADY_CLOCKED_IN');
  }

  const at = now();
  const workDate = todayKey();
  const session = await prisma.attendanceSession.create({
    data: { userId: user.id, workDate: keyToDb(workDate), clockIn: at, location, remarks: remarks || null },
  });

  await emit('clockIn', { userId: user.id, role: user.role, location, workDate, at, firstOfDay: sessions.length === 0 });
  return toSessionDto(session);
}

export async function pause(user: AuthUser, remarks?: string) {
  const open = (await todaySessions(user.id)).find((s) => s.clockOut === null);
  if (!open) throw conflict('אינך במשמרת כרגע', 'NOT_CLOCKED_IN');
  const session = await prisma.attendanceSession.update({
    where: { id: open.id },
    data: { clockOut: now(), endType: 'PAUSE', ...(remarks ? { remarks } : {}) },
  });
  return toSessionDto(session);
}

export async function clockOut(user: AuthUser, dailySummary: string, remarks?: string) {
  const sessions = await todaySessions(user.id);
  const { state, current } = stateOf(sessions);

  let target: AttendanceSession;
  if (state === 'IN' && current) {
    target = await prisma.attendanceSession.update({
      where: { id: current.id },
      data: { clockOut: now(), endType: 'END_OF_DAY', dailySummary, ...(remarks ? { remarks } : {}) },
    });
  } else if (state === 'PAUSED') {
    // Ending the day from a pause: the pause becomes the end of the day.
    const last = sessions[sessions.length - 1]!;
    target = await prisma.attendanceSession.update({
      where: { id: last.id },
      data: { endType: 'END_OF_DAY', dailySummary, ...(remarks ? { remarks } : {}) },
    });
  } else {
    throw conflict('אינך במשמרת כרגע', 'NOT_CLOCKED_IN');
  }
  return toSessionDto(target);
}

async function joinedAt(userId: number) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { createdAt: true } });
  return user.createdAt;
}

export async function getCalendar(user: AuthUser, monthKey = currentMonthKey()) {
  const { from, to } = monthRange(monthKey);
  const ctx = await loadDayContext([user.id], user.teamId, from, to);
  const days = describeDays(ctx.forUser(user.id, await joinedAt(user.id)), from, to);
  return {
    month: monthKey,
    totalWorkedMinutes: days.reduce((sum, d) => sum + d.workedMinutes, 0),
    gapCount: days.filter((d) => d.isGap).length,
    days,
  };
}

export async function getMissing(user: AuthUser, monthKey = currentMonthKey()) {
  const calendar = await getCalendar(user, monthKey);
  return calendar.days.filter((d) => d.isGap).map((d) => ({ date: d.date, status: d.status }));
}

const MAX_TEAM_RANGE_DAYS = 62;

export async function getTeamAttendance(leader: AuthUser, query: z.infer<typeof teamAttendanceQuerySchema>) {
  const from = query.from ?? todayKey();
  const to = query.to ?? from;
  if (to < from) throw badRequest('תאריך הסיום לפני תאריך ההתחלה', 'INVALID_RANGE');
  if (addDays(from, MAX_TEAM_RANGE_DAYS) < to) {
    throw badRequest(`ניתן להציג עד ${MAX_TEAM_RANGE_DAYS} ימים בבת אחת`, 'RANGE_TOO_LARGE');
  }

  const members = await prisma.user.findMany({
    where: {
      teamId: leader.teamId ?? -1,
      id: { not: leader.id, ...(query.userId ? { equals: query.userId } : {}) },
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' as const } } : {}),
    },
    select: { id: true, name: true, createdAt: true },
  });

  const ctx = await loadDayContext(
    members.map((m) => m.id),
    leader.teamId,
    from,
    to,
  );

  const hiddenStatuses = new Set(['WEEKEND', 'FUTURE', 'BEFORE_JOIN']);
  const rows = members.flatMap((m) =>
    describeDays(ctx.forUser(m.id, m.createdAt), from, to)
      .filter((d) => d.sessions.length > 0 || !hiddenStatuses.has(d.status))
      .filter((d) => !query.location || d.sessions.some((s) => s.location === query.location))
      .map((d) => ({
        ...d,
        user: { id: m.id, name: m.name },
        firstClockIn: d.sessions[0]?.clockIn ?? null,
        lastClockOut: d.sessions[d.sessions.length - 1]?.clockOut ?? null,
      })),
  );

  const order = query.order ?? (query.sort === 'date' ? 'desc' : 'asc');
  const dir = order === 'asc' ? 1 : -1;
  const compare: Record<typeof query.sort, (a: (typeof rows)[number], b: (typeof rows)[number]) => number> = {
    date: (a, b) => a.date.localeCompare(b.date) || a.user.name.localeCompare(b.user.name, 'he') * dir,
    name: (a, b) => a.user.name.localeCompare(b.user.name, 'he') || b.date.localeCompare(a.date) * dir,
    // Rows without a clock-in always go last.
    clockIn: (a, b) =>
      a.firstClockIn === b.firstClockIn
        ? 0
        : a.firstClockIn === null
          ? dir
          : b.firstClockIn === null
            ? -dir
            : a.firstClockIn.localeCompare(b.firstClockIn),
    workedMinutes: (a, b) => a.workedMinutes - b.workedMinutes,
  };
  return rows.sort((a, b) => compare[query.sort](a, b) * dir);
}

export async function getTeamNow(leader: AuthUser) {
  const members = await prisma.user.findMany({
    where: { teamId: leader.teamId ?? -1, id: { not: leader.id } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
  const sessions = await prisma.attendanceSession.findMany({
    where: { userId: { in: members.map((m) => m.id) }, workDate: keyToDb(todayKey()) },
    orderBy: { clockIn: 'asc' },
  });

  return members.map((m) => {
    const mine = sessions.filter((s) => s.userId === m.id);
    const { state, current } = stateOf(mine);
    const last = mine[mine.length - 1];
    return {
      user: m,
      state,
      location: current?.location ?? null,
      since: current ? current.clockIn.toISOString() : (last?.clockOut?.toISOString() ?? null),
      workedMinutesToday: mine.reduce((sum, s) => sum + liveSessionMinutes(s), 0),
    };
  });
}

