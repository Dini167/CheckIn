import type { Prisma } from '@prisma/client';
import type { AuthUser } from '../../common/auth';
import { dbToKey, keyToDb, todayKey } from '../../common/dates';
import { badRequest, notFound } from '../../common/errors';
import { prisma } from '../../common/prisma';
import type { z } from '../../common/zod';
import type { createAnnouncementSchema, updateAnnouncementSchema } from './announcements.schemas';

const include = { author: { select: { id: true, name: true } } } satisfies Prisma.AnnouncementInclude;
type AnnouncementRow = Prisma.AnnouncementGetPayload<{ include: typeof include }>;

function toDto(a: AnnouncementRow) {
  const expires = a.expiresAt ? dbToKey(a.expiresAt) : null;
  return {
    id: a.id,
    title: a.title,
    content: a.content,
    expiresAt: expires,
    isActive: expires === null || expires >= todayKey(),
    author: a.author,
    createdAt: a.createdAt.toISOString(),
  };
}

export async function list(user: AuthUser, includeExpired: boolean) {
  const showAll = includeExpired && user.role === 'TEAM_LEADER';
  const rows = await prisma.announcement.findMany({
    where: {
      teamId: user.teamId ?? -1,
      ...(showAll ? {} : { OR: [{ expiresAt: null }, { expiresAt: { gte: keyToDb(todayKey()) } }] }),
    },
    include,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toDto);
}

function checkExpiry(expiresAt: string | null | undefined) {
  if (expiresAt && expiresAt < todayKey()) throw badRequest('תאריך התוקף כבר עבר', 'EXPIRES_IN_PAST');
}

export async function create(leader: AuthUser, input: z.infer<typeof createAnnouncementSchema>) {
  checkExpiry(input.expiresAt);
  const row = await prisma.announcement.create({
    data: {
      teamId: leader.teamId!,
      authorId: leader.id,
      title: input.title,
      content: input.content,
      expiresAt: input.expiresAt ? keyToDb(input.expiresAt) : null,
    },
    include,
  });
  return toDto(row);
}

async function getOwn(leader: AuthUser, id: number) {
  const row = await prisma.announcement.findFirst({ where: { id, teamId: leader.teamId ?? -1 } });
  if (!row) throw notFound('ההודעה לא נמצאה');
  return row;
}

export async function update(leader: AuthUser, id: number, input: z.infer<typeof updateAnnouncementSchema>) {
  await getOwn(leader, id);
  checkExpiry(input.expiresAt);
  const row = await prisma.announcement.update({
    where: { id },
    data: {
      ...(input.title ? { title: input.title } : {}),
      ...(input.content ? { content: input.content } : {}),
      ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt ? keyToDb(input.expiresAt) : null } : {}),
    },
    include,
  });
  return toDto(row);
}

export async function remove(leader: AuthUser, id: number) {
  await getOwn(leader, id);
  await prisma.announcement.delete({ where: { id } });
}
