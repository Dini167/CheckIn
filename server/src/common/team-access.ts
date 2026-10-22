import { prisma } from './prisma';
import { notFound } from './errors';
import type { AuthUser } from './auth';

/**
 * Loads a user that belongs to the leader's team.
 * Users of other teams get 404 — we don't reveal that they exist.
 */
export async function getTeamMemberOrThrow(leader: AuthUser, userId: number) {
  const member = await prisma.user.findFirst({
    where: { id: userId, teamId: leader.teamId ?? -1 },
    select: { id: true, name: true, email: true, role: true, hourlyRate: true, teamId: true },
  });
  if (!member) throw notFound('העובד לא נמצא בצוות שלך');
  return member;
}

export async function getTeamMemberIds(teamId: number | null): Promise<number[]> {
  if (teamId === null) return [];
  const members = await prisma.user.findMany({ where: { teamId }, select: { id: true } });
  return members.map((m) => m.id);
}

/** True when the month containing the given day is locked for the team. */
export async function isMonthLocked(teamId: number | null, dateKey: string): Promise<boolean> {
  if (teamId === null) return false;
  const [year, month] = dateKey.split('-').map(Number) as [number, number];
  const lock = await prisma.monthLock.findUnique({ where: { teamId_year_month: { teamId, year, month } } });
  return lock !== null;
}
