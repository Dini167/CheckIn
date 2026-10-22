import type { AttendanceSession, NonWorkingDayType, ReviewStatus } from '@prisma/client';
import { dateKey, daysBetween, dayOfWeek, dbToKey, isWorkDay, keyToDb, todayKey } from '../../common/dates';
import { prisma } from '../../common/prisma';
import { closedSessionMinutes, liveSessionMinutes } from '../../common/worktime';
import { toSessionDto } from './attendance.mapper';

export type DayStatus =
  | 'WORKED'
  | 'IN_PROGRESS'
  | 'MISSING'
  | 'MISSING_EXIT'
  | 'SICK'
  | 'NON_WORKING'
  | 'WEEKEND'
  | 'FUTURE'
  | 'NOT_STARTED'
  | 'BEFORE_JOIN';

interface DayContext {
  sessions: AttendanceSession[];
  sickNotes: { id: number; fromDate: Date; toDate: Date; status: ReviewStatus }[];
  nonWorkingDays: Map<string, { type: NonWorkingDayType; note: string | null }>;
  joinedKey: string;
}

/** Loads everything needed to describe a range of days for one or more users of one team. */
export async function loadDayContext(userIds: number[], teamId: number | null, fromKey: string, toKey: string) {
  const [sessions, sickNotes, nonWorking] = await Promise.all([
    prisma.attendanceSession.findMany({
      where: { userId: { in: userIds }, workDate: { gte: keyToDb(fromKey), lte: keyToDb(toKey) } },
      orderBy: { clockIn: 'asc' },
    }),
    prisma.sickNote.findMany({
      where: {
        userId: { in: userIds },
        status: { in: ['PENDING', 'APPROVED'] },
        fromDate: { lte: keyToDb(toKey) },
        toDate: { gte: keyToDb(fromKey) },
      },
      select: { id: true, userId: true, fromDate: true, toDate: true, status: true },
    }),
    teamId === null
      ? Promise.resolve([])
      : prisma.nonWorkingDay.findMany({
          where: { teamId, date: { gte: keyToDb(fromKey), lte: keyToDb(toKey) } },
        }),
  ]);

  const nonWorkingDays = new Map(nonWorking.map((d) => [dbToKey(d.date), { type: d.type, note: d.note }]));
  return {
    forUser(userId: number, joinedAt: Date): DayContext {
      return {
        sessions: sessions.filter((s) => s.userId === userId),
        sickNotes: sickNotes.filter((n) => n.userId === userId),
        nonWorkingDays,
        joinedKey: dateKey(joinedAt),
      };
    },
  };
}

export function describeDays(ctx: DayContext, fromKey: string, toKey: string) {
  const today = todayKey();

  return daysBetween(fromKey, toKey).map((key) => {
    const sessions = ctx.sessions.filter((s) => dbToKey(s.workDate) === key);
    const nonWorking = ctx.nonWorkingDays.get(key) ?? null;
    const coveringNotes = ctx.sickNotes.filter((n) => dbToKey(n.fromDate) <= key && dbToKey(n.toDate) >= key);
    const sickNote = coveringNotes.find((n) => n.status === 'APPROVED') ?? coveringNotes[0] ?? null;

    let status: DayStatus;
    const hasOpen = sessions.some((s) => s.clockOut === null);
    if (sessions.length > 0) {
      if (hasOpen) status = key === today ? 'IN_PROGRESS' : 'MISSING_EXIT';
      else status = 'WORKED';
    } else if (key > today) status = 'FUTURE';
    else if (key < ctx.joinedKey) status = 'BEFORE_JOIN';
    else if (!isWorkDay(key)) status = 'WEEKEND';
    else if (nonWorking) status = 'NON_WORKING';
    else if (sickNote?.status === 'APPROVED') status = 'SICK';
    else if (key === today) status = 'NOT_STARTED';
    else status = 'MISSING';

    const workedMinutes =
      key === today
        ? sessions.reduce((sum, s) => sum + liveSessionMinutes(s), 0)
        : sessions.reduce((sum, s) => sum + closedSessionMinutes(s), 0);
    const lastSummary = [...sessions].reverse().find((s) => s.dailySummary)?.dailySummary ?? null;

    return {
      date: key,
      dayOfWeek: dayOfWeek(key),
      status,
      isGap: status === 'MISSING' || status === 'MISSING_EXIT',
      workedMinutes,
      dailySummary: lastSummary,
      sessions: sessions.map(toSessionDto),
      nonWorkingDay: nonWorking,
      sickNote: sickNote ? { id: sickNote.id, status: sickNote.status } : null,
    };
  });
}
