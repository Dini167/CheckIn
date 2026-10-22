import type { Prisma } from '@prisma/client';
import { rules } from '../../config/rules';
import type { AuthUser } from '../../common/auth';
import { now } from '../../common/clock';
import { daysBetween, dbToKey, keyToDb } from '../../common/dates';
import { badRequest, conflict, notFound } from '../../common/errors';
import { prisma } from '../../common/prisma';
import { getTeamMemberIds } from '../../common/team-access';
import type { z } from '../../common/zod';
import type { createSickNoteSchema } from './sick-notes.schemas';

// Never select fileData for lists — files are only sent by the dedicated download endpoint.
const listSelect = {
  id: true,
  userId: true,
  fromDate: true,
  toDate: true,
  note: true,
  fileName: true,
  mimeType: true,
  status: true,
  reviewedAt: true,
  createdAt: true,
  user: { select: { id: true, name: true } },
  reviewedBy: { select: { id: true, name: true } },
} satisfies Prisma.SickNoteSelect;

type SickNoteRow = Prisma.SickNoteGetPayload<{ select: typeof listSelect }>;

async function fileSizes(ids: number[]): Promise<Map<number, number>> {
  if (ids.length === 0) return new Map();
  const rows = await prisma.$queryRaw<{ id: number; size: number }[]>`
    SELECT id, octet_length("fileData")::int AS size FROM "SickNote" WHERE id = ANY(${ids})`;
  return new Map(rows.map((r) => [r.id, r.size]));
}

async function toDtos(rows: SickNoteRow[]) {
  const sizes = await fileSizes(rows.map((r) => r.id));
  return rows.map((n) => {
    const from = dbToKey(n.fromDate);
    const to = dbToKey(n.toDate);
    return {
      id: n.id,
      user: n.user,
      fromDate: from,
      toDate: to,
      days: daysBetween(from, to).length,
      note: n.note,
      fileName: n.fileName,
      mimeType: n.mimeType,
      fileSize: sizes.get(n.id) ?? 0,
      fileUrl: `/api/sick-notes/${n.id}/file`,
      status: n.status,
      reviewedBy: n.reviewedBy,
      reviewedAt: n.reviewedAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    };
  });
}

/** Multipart file names arrive as latin1; decode them back to UTF-8 (needed for Hebrew names). */
function decodeFileName(name: string): string {
  const decoded = Buffer.from(name, 'latin1').toString('utf8');
  return decoded.includes('�') ? name : decoded;
}

/** Checks the real file content, not only the declared type. */
function matchesSignature(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === 'application/pdf') return buffer.subarray(0, 5).toString('latin1') === '%PDF-';
  if (mimeType === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  return false;
}

export async function createSickNote(
  user: AuthUser,
  input: z.infer<typeof createSickNoteSchema>,
  file: { originalname: string; mimetype: string; buffer: Buffer } | undefined,
) {
  if (!file) throw badRequest('יש לצרף קובץ (תמונה או PDF)', 'FILE_REQUIRED');
  if (!rules.sickNoteMimeTypes.includes(file.mimetype) || !matchesSignature(file.buffer, file.mimetype)) {
    throw badRequest('ניתן להעלות רק JPG, PNG או PDF', 'INVALID_FILE_TYPE');
  }
  if (daysBetween(input.fromDate, input.toDate).length > rules.sickNoteMaxDays) {
    throw badRequest(`אישור מחלה יכול לכסות עד ${rules.sickNoteMaxDays} ימים`, 'RANGE_TOO_LARGE');
  }

  const created = await prisma.sickNote.create({
    data: {
      userId: user.id,
      fromDate: keyToDb(input.fromDate),
      toDate: keyToDb(input.toDate),
      note: input.note || null,
      fileName: decodeFileName(file.originalname).slice(0, 200),
      mimeType: file.mimetype,
      fileData: new Uint8Array(file.buffer),
    },
    select: listSelect,
  });
  return (await toDtos([created]))[0];
}

export async function listMine(user: AuthUser) {
  const rows = await prisma.sickNote.findMany({
    where: { userId: user.id },
    select: listSelect,
    orderBy: { fromDate: 'desc' },
  });
  return toDtos(rows);
}

export async function listTeam(leader: AuthUser, status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
  const rows = await prisma.sickNote.findMany({
    where: { userId: { in: await getTeamMemberIds(leader.teamId) }, ...(status ? { status } : {}) },
    select: listSelect,
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });
  return toDtos(rows);
}

/** The owner, or the team leader of the owner's team, may open the file. */
export async function getFile(user: AuthUser, id: number) {
  const allowedOwners = user.role === 'TEAM_LEADER' ? await getTeamMemberIds(user.teamId) : [user.id];
  const note = await prisma.sickNote.findFirst({
    where: { id, userId: { in: allowedOwners } },
    select: { fileName: true, mimeType: true, fileData: true },
  });
  if (!note) throw notFound('האישור לא נמצא');
  return note;
}

export async function review(leader: AuthUser, id: number, decision: 'APPROVED' | 'REJECTED') {
  const note = await prisma.sickNote.findFirst({
    where: { id, userId: { in: await getTeamMemberIds(leader.teamId) } },
    select: { id: true, status: true },
  });
  if (!note) throw notFound('האישור לא נמצא');
  if (note.status !== 'PENDING') throw conflict('האישור כבר טופל', 'ALREADY_REVIEWED');

  const updated = await prisma.sickNote.update({
    where: { id },
    data: { status: decision, reviewedById: leader.id, reviewedAt: now() },
    select: listSelect,
  });
  return (await toDtos([updated]))[0];
}
