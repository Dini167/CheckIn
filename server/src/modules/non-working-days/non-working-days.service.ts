import type { NonWorkingDay } from '@prisma/client';
import { rules } from '../../config/rules';
import type { AuthUser } from '../../common/auth';
import { currentMonthKey, daysBetween, dbToKey, keyToDb, monthRange } from '../../common/dates';
import { badRequest, notFound } from '../../common/errors';
import { prisma } from '../../common/prisma';
import type { z } from '../../common/zod';
import type { createDaysSchema, updateDaySchema } from './non-working-days.schemas';

const toDto = (d: NonWorkingDay) => ({ id: d.id, date: dbToKey(d.date), type: d.type, note: d.note });

export async function list(user: AuthUser, monthKey = currentMonthKey()) {
  const { from, to } = monthRange(monthKey);
  const days = await prisma.nonWorkingDay.findMany({
    where: { teamId: user.teamId ?? -1, date: { gte: keyToDb(from), lte: keyToDb(to) } },
    orderBy: { date: 'asc' },
  });
  return days.map(toDto);
}

/** Adds one day or a range. Days that already exist are updated instead of duplicated. */
export async function create(leader: AuthUser, input: z.infer<typeof createDaysSchema>) {
  const keys = daysBetween(input.fromDate, input.toDate ?? input.fromDate);
  if (keys.length > rules.nonWorkingDaysMaxRange) {
    throw badRequest(`אפשר לסמן עד ${rules.nonWorkingDaysMaxRange} ימים בבת אחת`, 'RANGE_TOO_LARGE');
  }
  const teamId = leader.teamId!;
  const days = await prisma.$transaction(
    keys.map((key) =>
      prisma.nonWorkingDay.upsert({
        where: { teamId_date: { teamId, date: keyToDb(key) } },
        create: { teamId, date: keyToDb(key), type: input.type, note: input.note || null },
        update: { type: input.type, note: input.note || null },
      }),
    ),
  );
  return days.map(toDto);
}

async function getOwn(leader: AuthUser, id: number) {
  const day = await prisma.nonWorkingDay.findFirst({ where: { id, teamId: leader.teamId ?? -1 } });
  if (!day) throw notFound('היום לא נמצא');
  return day;
}

export async function update(leader: AuthUser, id: number, input: z.infer<typeof updateDaySchema>) {
  await getOwn(leader, id);
  const day = await prisma.nonWorkingDay.update({
    where: { id },
    data: {
      ...(input.type ? { type: input.type } : {}),
      ...(input.note !== undefined ? { note: input.note || null } : {}),
    },
  });
  return toDto(day);
}

export async function remove(leader: AuthUser, id: number) {
  await getOwn(leader, id);
  await prisma.nonWorkingDay.delete({ where: { id } });
}
