import type { AttendanceSession } from '@prisma/client';
import { now } from './clock';
import { dbToKey, keyToDb } from './dates';
import { prisma } from './prisma';

/**
 * Shared work-time math, used by attendance, tasks and salary.
 * Only closed sessions count toward paid time; an open session from a past day is a "missing exit"
 * and counts nothing until it is corrected.
 */

export function closedSessionMinutes(session: Pick<AttendanceSession, 'clockIn' | 'clockOut'>): number {
  if (!session.clockOut) return 0;
  return Math.max(0, Math.round((session.clockOut.getTime() - session.clockIn.getTime()) / 60000));
}

/** Minutes worked so far, including an open session up to now (for "today" views). */
export function liveSessionMinutes(session: Pick<AttendanceSession, 'clockIn' | 'clockOut'>): number {
  const end = session.clockOut ?? now();
  return Math.max(0, Math.round((end.getTime() - session.clockIn.getTime()) / 60000));
}

export async function getSessions(userIds: number | number[], fromKey: string, toKey: string) {
  return prisma.attendanceSession.findMany({
    where: {
      userId: Array.isArray(userIds) ? { in: userIds } : userIds,
      workDate: { gte: keyToDb(fromKey), lte: keyToDb(toKey) },
    },
    orderBy: { clockIn: 'asc' },
  });
}

/** Paid minutes per day: Map<dateKey, minutes>. */
export function minutesByDay(sessions: AttendanceSession[]): Map<string, number> {
  const result = new Map<string, number>();
  for (const s of sessions) {
    const key = dbToKey(s.workDate);
    result.set(key, (result.get(key) ?? 0) + closedSessionMinutes(s));
  }
  return result;
}

/** True when the user was clocked in at the given instant. */
export function wasClockedInAt(sessions: Pick<AttendanceSession, 'clockIn' | 'clockOut'>[], at: Date): boolean {
  return sessions.some((s) => s.clockIn <= at && (s.clockOut === null || s.clockOut >= at));
}
