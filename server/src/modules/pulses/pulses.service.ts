import { randomInt } from 'node:crypto';
import type { AttendanceSession, Pulse } from '@prisma/client';
import { rules } from '../../config/rules';
import type { AuthUser } from '../../common/auth';
import { now } from '../../common/clock';
import { addDays, dbToKey, keyToDb, todayKey } from '../../common/dates';
import { AppError, badRequest, conflict, notFound } from '../../common/errors';
import type { AppEvents } from '../../common/events';
import { prisma } from '../../common/prisma';
import { wasClockedInAt } from '../../common/worktime';
import { PULSE_QUESTION } from './pulses.schemas';

type PulseStatus = 'SCHEDULED' | 'OPEN' | 'ANSWERED' | 'MISSED' | 'CANCELLED';

const responseMs = rules.pulseResponseMinutes * 60_000;

export function expiresAt(pulse: Pick<Pulse, 'scheduledAt'>): Date {
  return new Date(pulse.scheduledAt.getTime() + responseMs);
}

/**
 * A pulse only counts if the employee was clocked in when it fired.
 * If they were on a pause or already out, it is CANCELLED — not a miss.
 */
export function pulseStatus(pulse: Pulse, sessions: Pick<AttendanceSession, 'clockIn' | 'clockOut'>[], at = now()): PulseStatus {
  if (pulse.answeredAt) return 'ANSWERED';
  if (at < pulse.scheduledAt) return 'SCHEDULED';
  if (!wasClockedInAt(sessions, pulse.scheduledAt)) return 'CANCELLED';
  if (at < expiresAt(pulse)) return 'OPEN';
  return 'MISSED';
}

/** Called on the first clock-in of the day: schedules the day's random checks (employees only). */
export async function scheduleDailyPulses(event: AppEvents['clockIn']): Promise<void> {
  if (event.role !== 'EMPLOYEE') return;
  const workDate = keyToDb(event.workDate);
  const existing = await prisma.pulse.count({ where: { userId: event.userId, workDate } });
  if (existing > 0) return;

  const windowStart = event.at.getTime() + rules.pulseWindowStartMinutes * 60_000;
  const windowEnd = event.at.getTime() + rules.pulseWindowEndMinutes * 60_000;
  const segment = Math.floor((windowEnd - windowStart) / rules.pulsesPerDay);

  // One random moment inside each equal slice of the window, so checks never bunch together.
  const times = Array.from({ length: rules.pulsesPerDay }, (_, i) => {
    const sliceStart = windowStart + i * segment;
    const usable = Math.max(1, segment - responseMs);
    return new Date(sliceStart + randomInt(usable));
  });

  await prisma.pulse.createMany({
    data: times.map((scheduledAt) => ({ userId: event.userId, workDate, scheduledAt })),
  });
}

async function sessionsOn(userIds: number[], fromKey: string, toKey: string) {
  return prisma.attendanceSession.findMany({
    where: { userId: { in: userIds }, workDate: { gte: keyToDb(fromKey), lte: keyToDb(toKey) } },
    select: { userId: true, clockIn: true, clockOut: true },
  });
}

export async function getCurrent(user: AuthUser) {
  const at = now();
  const today = todayKey();
  const [pulses, sessions] = await Promise.all([
    prisma.pulse.findMany({
      where: { userId: user.id, workDate: keyToDb(today), answeredAt: null, scheduledAt: { lte: at } },
      orderBy: { scheduledAt: 'asc' },
    }),
    sessionsOn([user.id], today, today),
  ]);
  const open = pulses.find((p) => pulseStatus(p, sessions, at) === 'OPEN');
  if (!open) return { pulse: null };
  const expires = expiresAt(open);
  return {
    pulse: {
      id: open.id,
      question: PULSE_QUESTION,
      openedAt: open.scheduledAt.toISOString(),
      expiresAt: expires.toISOString(),
      secondsLeft: Math.max(0, Math.round((expires.getTime() - at.getTime()) / 1000)),
    },
  };
}

export async function respond(user: AuthUser, pulseId: number, responseText: string) {
  const pulse = await prisma.pulse.findFirst({ where: { id: pulseId, userId: user.id } });
  if (!pulse) throw notFound('הבדיקה לא נמצאה');

  const day = dbToKey(pulse.workDate);
  const status = pulseStatus(pulse, await sessionsOn([user.id], day, day));
  switch (status) {
    case 'ANSWERED':
      throw conflict('כבר ענית על הבדיקה הזו', 'ALREADY_ANSWERED');
    case 'MISSED':
      throw new AppError(410, 'PULSE_EXPIRED', `עברו ${rules.pulseResponseMinutes} דקות — הבדיקה נסגרה`);
    case 'SCHEDULED':
    case 'CANCELLED':
      throw conflict('הבדיקה אינה פתוחה כרגע', 'PULSE_NOT_OPEN');
    case 'OPEN':
      break;
  }

  const updated = await prisma.pulse.update({
    where: { id: pulse.id },
    data: { answeredAt: now(), responseText },
  });
  return { id: updated.id, status: 'ANSWERED' as const, answeredAt: updated.answeredAt!.toISOString() };
}

export async function listMine(user: AuthUser, dateKey = todayKey()) {
  const [pulses, sessions] = await Promise.all([
    prisma.pulse.findMany({ where: { userId: user.id, workDate: keyToDb(dateKey) }, orderBy: { scheduledAt: 'asc' } }),
    sessionsOn([user.id], dateKey, dateKey),
  ]);
  const at = now();
  return pulses.flatMap((p) => {
    const status = pulseStatus(p, sessions, at);
    // Future check times stay secret, otherwise the check would not be random.
    if (status === 'SCHEDULED') return [];
    return [
      {
        id: p.id,
        scheduledAt: p.scheduledAt.toISOString(),
        status,
        answeredAt: p.answeredAt?.toISOString() ?? null,
        responseText: p.responseText,
      },
    ];
  });
}

const MAX_RANGE_DAYS = 62;

/** Days on which an employee missed ALL of the day's checks. Never exposes answer texts. */
export async function getRedDots(leader: AuthUser, fromKey = todayKey(), toKey = fromKey) {
  if (toKey < fromKey) throw badRequest('תאריך הסיום לפני תאריך ההתחלה', 'INVALID_RANGE');
  if (addDays(fromKey, MAX_RANGE_DAYS) < toKey) throw badRequest('טווח גדול מדי', 'RANGE_TOO_LARGE');

  const employees = await prisma.user.findMany({
    where: { teamId: leader.teamId ?? -1, role: 'EMPLOYEE' },
    select: { id: true, name: true },
  });
  const ids = employees.map((e) => e.id);
  const [pulses, sessions] = await Promise.all([
    prisma.pulse.findMany({
      where: { userId: { in: ids }, workDate: { gte: keyToDb(fromKey), lte: keyToDb(toKey) } },
    }),
    sessionsOn(ids, fromKey, toKey),
  ]);

  const at = now();
  const groups = new Map<string, Pulse[]>();
  for (const p of pulses) {
    const key = `${p.userId}|${dbToKey(p.workDate)}`;
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }

  const dots = [];
  for (const [key, dayPulses] of groups) {
    const [userIdText, date] = key.split('|') as [string, string];
    const userId = Number(userIdText);
    const userSessions = sessions.filter((s) => s.userId === userId);
    const missed = dayPulses.filter((p) => pulseStatus(p, userSessions, at) === 'MISSED').length;
    if (dayPulses.length >= rules.pulsesPerDay && missed === dayPulses.length) {
      dots.push({ date, user: employees.find((e) => e.id === userId)!, missedCount: missed });
    }
  }
  return dots.sort((a, b) => b.date.localeCompare(a.date) || a.user.name.localeCompare(b.user.name, 'he'));
}
