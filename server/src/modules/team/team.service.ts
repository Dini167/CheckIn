import type { AuthUser } from '../../common/auth';
import { notFound } from '../../common/errors';
import { prisma } from '../../common/prisma';
import { getTeamMemberOrThrow } from '../../common/team-access';

export async function getMyTeam(user: AuthUser) {
  const team = await prisma.team.findUnique({
    where: { id: user.teamId ?? -1 },
    include: { leader: { select: { id: true, name: true } }, _count: { select: { members: true } } },
  });
  if (!team) throw notFound('אינך משויך/ת לצוות');
  const isLeader = team.leaderId === user.id;
  return {
    id: team.id,
    name: team.name,
    leader: team.leader,
    memberCount: team._count.members,
    ...(isLeader ? { joinCode: team.joinCode } : {}),
  };
}

export async function listMembers(leader: AuthUser, onlyMissingSalary: boolean) {
  const members = await prisma.user.findMany({
    where: { teamId: leader.teamId ?? -1, ...(onlyMissingSalary ? { hourlyRate: null } : {}) },
    select: { id: true, name: true, email: true, role: true, hourlyRate: true, createdAt: true },
  });
  return members
    .map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      salary: m.hourlyRate === null ? null : Number(m.hourlyRate),
      salaryMissing: m.hourlyRate === null,
      joinedAt: m.createdAt.toISOString(),
    }))
    // New employees without a rate come first, then alphabetical.
    .sort((a, b) => Number(b.salaryMissing) - Number(a.salaryMissing) || a.name.localeCompare(b.name, 'he'));
}

export async function updateSalary(leader: AuthUser, memberId: number, salary: number) {
  await getTeamMemberOrThrow(leader, memberId);
  const updated = await prisma.user.update({
    where: { id: memberId },
    data: { hourlyRate: salary },
    select: { id: true, name: true, hourlyRate: true },
  });
  return { id: updated.id, name: updated.name, salary: Number(updated.hourlyRate) };
}
