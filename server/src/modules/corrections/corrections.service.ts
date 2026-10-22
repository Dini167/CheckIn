import type { Prisma, TimeCorrection, WorkLocation } from '@prisma/client';
import { rules } from '../../config/rules';
import type { AuthUser } from '../../common/auth';
import { now } from '../../common/clock';
import { dbToKey, keyToDb, startOfDay, timeOfDay, todayKey, weekStartKey, zonedTimeToUtc } from '../../common/dates';
import { badRequest, conflict, notFound } from '../../common/errors';
import { prisma } from '../../common/prisma';
import { getTeamMemberIds, isMonthLocked } from '../../common/team-access';
import type { z } from '../../common/zod';
import type { createCorrectionSchema, teamCorrectionsQuerySchema } from './corrections.schemas';

type CreateInput = z.infer<typeof createCorrectionSchema>;

const include = {
  user: { select: { id: true, name: true } },
  reviewedBy: { select: { id: true, name: true } },
} satisfies Prisma.TimeCorrectionInclude;

type CorrectionWithUsers = Prisma.TimeCorrectionGetPayload<{ include: typeof include }>;

function toDto(c: CorrectionWithUsers) {
  return {
    id: c.id,
    user: c.user,
    workDate: dbToKey(c.workDate),
    sessionId: c.sessionId,
    newClockIn: c.newClockIn?.toISOString() ?? null,
    newClockInTime: c.newClockIn ? timeOfDay(c.newClockIn) : null,
    newClockOut: c.newClockOut?.toISOString() ?? null,
    newClockOutTime: c.newClockOut ? timeOfDay(c.newClockOut) : null,
    location: c.location,
    reason: c.reason,
    kind: c.kind,
    status: c.status,
    units: c.units,
    reviewedBy: c.reviewedBy,
    reviewedAt: c.reviewedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

export async function getQuota(user: AuthUser) {
  const weekStart = weekStartKey(todayKey());
  const used = await prisma.timeCorrection.aggregate({
    where: { userId: user.id, kind: 'SELF', createdAt: { gte: startOfDay(weekStart) } },
    _sum: { units: true },
  });
  const usedUnits = used._sum.units ?? 0;
  const unlimited = user.role === 'TEAM_LEADER';
  const limit = rules.selfCorrectionsPerWeek;
  return {
    unlimited,
    limit,
    used: usedUnits,
    remaining: unlimited ? limit : Math.max(0, limit - usedUnits),
    weekStart,
  };
}

interface ResolvedCorrection {
  workDate: string;
  sessionId: number | null;
  newClockIn: Date | null;
  newClockOut: Date | null;
  location: WorkLocation | null;
}

/** Validates a correction against the current data. Used on create and again on approval. */
async function validateCorrection(userId: number, teamId: number | null, c: ResolvedCorrection) {
  if (c.workDate > todayKey()) throw badRequest('לא ניתן לתקן תאריך עתידי', 'FUTURE_DATE');
  if (await isMonthLocked(teamId, c.workDate)) {
    throw conflict('החודש נעול ע"י ראש הצוות — לא ניתן לשנות שעות', 'MONTH_LOCKED');
  }

  let clockIn = c.newClockIn;
  let clockOut = c.newClockOut;
  if (c.sessionId !== null) {
    const session = await prisma.attendanceSession.findFirst({ where: { id: c.sessionId, userId } });
    if (!session) throw notFound('קטע הנוכחות לא נמצא');
    if (dbToKey(session.workDate) !== c.workDate) throw badRequest('קטע הנוכחות שייך לתאריך אחר', 'DATE_MISMATCH');
    clockIn ??= session.clockIn;
    clockOut ??= session.clockOut;
  }

  const at = now();
  if ((clockIn && clockIn > at) || (clockOut && clockOut > at)) {
    throw badRequest('לא ניתן להזין שעה עתידית', 'FUTURE_TIME');
  }
  if (clockIn && clockOut && clockOut <= clockIn) {
    throw badRequest('שעת היציאה חייבת להיות אחרי שעת הכניסה', 'INVALID_TIME_RANGE');
  }

  if (clockIn && clockOut) {
    const others = await prisma.attendanceSession.findMany({
      where: { userId, workDate: keyToDb(c.workDate), ...(c.sessionId ? { id: { not: c.sessionId } } : {}) },
    });
    const overlaps = others.some((o) => o.clockIn < clockOut! && (o.clockOut ?? at) > clockIn!);
    if (overlaps) throw conflict('השעות חופפות לקטע נוכחות אחר באותו יום', 'OVERLAP');
  }
}

async function applyCorrection(tx: Prisma.TransactionClient, userId: number, c: TimeCorrection) {
  if (c.sessionId !== null) {
    const session = await tx.attendanceSession.findUniqueOrThrow({ where: { id: c.sessionId } });
    const closing = c.newClockOut !== null && session.endType === null;
    await tx.attendanceSession.update({
      where: { id: c.sessionId },
      data: {
        ...(c.newClockIn ? { clockIn: c.newClockIn } : {}),
        ...(c.newClockOut ? { clockOut: c.newClockOut } : {}),
        ...(closing ? { endType: 'END_OF_DAY' } : {}),
        isManual: true,
      },
    });
    return;
  }
  const created = await tx.attendanceSession.create({
    data: {
      userId,
      workDate: c.workDate,
      clockIn: c.newClockIn!,
      clockOut: c.newClockOut!,
      location: c.location ?? 'OFFICE',
      endType: 'END_OF_DAY',
      isManual: true,
    },
  });
  await tx.timeCorrection.update({ where: { id: c.id }, data: { sessionId: created.id } });
}

export async function createCorrection(user: AuthUser, input: CreateInput) {
  const resolved: ResolvedCorrection = {
    workDate: input.workDate,
    sessionId: input.sessionId ?? null,
    newClockIn: input.newClockIn ? zonedTimeToUtc(input.workDate, input.newClockIn) : null,
    newClockOut: input.newClockOut ? zonedTimeToUtc(input.workDate, input.newClockOut) : null,
    location: input.sessionId ? null : (input.location ?? 'OFFICE'),
  };
  await validateCorrection(user.id, user.teamId, resolved);

  const units = (input.newClockIn ? 1 : 0) + (input.newClockOut ? 1 : 0);
  const quota = await getQuota(user);
  const isSelf = quota.unlimited || quota.used + units <= quota.limit;

  const id = await prisma.$transaction(async (tx) => {
    const correction = await tx.timeCorrection.create({
      data: {
        userId: user.id,
        sessionId: resolved.sessionId,
        workDate: keyToDb(resolved.workDate),
        newClockIn: resolved.newClockIn,
        newClockOut: resolved.newClockOut,
        location: resolved.location,
        reason: input.reason,
        kind: isSelf ? 'SELF' : 'REQUEST',
        status: isSelf ? 'APPLIED' : 'PENDING',
        units,
        createdAt: now(),
      },
    });
    if (isSelf) await applyCorrection(tx, user.id, correction);
    return correction.id;
  });

  return toDto(await prisma.timeCorrection.findUniqueOrThrow({ where: { id }, include }));
}

export async function listMine(user: AuthUser) {
  const items = await prisma.timeCorrection.findMany({
    where: { userId: user.id },
    include,
    orderBy: { createdAt: 'desc' },
  });
  return items.map(toDto);
}

export async function listTeam(leader: AuthUser, query: z.infer<typeof teamCorrectionsQuerySchema>) {
  const items = await prisma.timeCorrection.findMany({
    where: {
      userId: { in: await getTeamMemberIds(leader.teamId) },
      ...(query.status ? { status: query.status } : {}),
      ...(query.kind ? { kind: query.kind } : {}),
    },
    include,
    orderBy: { createdAt: 'desc' },
  });
  return items.map(toDto);
}

export async function review(leader: AuthUser, id: number, decision: 'APPROVED' | 'REJECTED') {
  const correction = await prisma.timeCorrection.findFirst({
    where: { id, userId: { in: await getTeamMemberIds(leader.teamId) } },
  });
  if (!correction) throw notFound('הבקשה לא נמצאה');
  if (correction.status !== 'PENDING') throw conflict('הבקשה כבר טופלה', 'ALREADY_REVIEWED');

  if (decision === 'APPROVED') {
    // The data may have changed since the request was sent — validate again.
    await validateCorrection(correction.userId, leader.teamId, {
      workDate: dbToKey(correction.workDate),
      sessionId: correction.sessionId,
      newClockIn: correction.newClockIn,
      newClockOut: correction.newClockOut,
      location: correction.location,
    });
  }

  await prisma.$transaction(async (tx) => {
    const updated = await tx.timeCorrection.update({
      where: { id },
      data: { status: decision, reviewedById: leader.id, reviewedAt: now() },
    });
    if (decision === 'APPROVED') await applyCorrection(tx, correction.userId, updated);
  });

  return toDto(await prisma.timeCorrection.findUniqueOrThrow({ where: { id }, include }));
}
