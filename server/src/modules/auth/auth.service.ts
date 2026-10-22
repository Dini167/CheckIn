import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { Prisma } from '@prisma/client';
import { signToken } from '../../common/auth';
import { AppError, conflict, notFound, unauthorized } from '../../common/errors';
import { prisma } from '../../common/prisma';
import type { LoginInput, RegisterInput } from './auth.schemas';

const BCRYPT_ROUNDS = 10;

const userWithTeam = {
  id: true,
  name: true,
  email: true,
  role: true,
  hourlyRate: true,
  team: { select: { id: true, name: true, joinCode: true, leaderId: true } },
} satisfies Prisma.UserSelect;

type UserWithTeam = Prisma.UserGetPayload<{ select: typeof userWithTeam }>;

/** The only user shape ever returned by the API — never includes passwordHash. */
export function toPublicUser(user: UserWithTeam) {
  const isLeader = user.team?.leaderId === user.id;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    salary: user.hourlyRate === null ? null : Number(user.hourlyRate),
    team: user.team
      ? { id: user.team.id, name: user.team.name, ...(isLeader ? { joinCode: user.team.joinCode } : {}) }
      : null,
  };
}

async function generateJoinCode(tx: Prisma.TransactionClient): Promise<string> {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = 'TEAM-';
    for (let i = 0; i < 5; i++) code += alphabet[randomInt(alphabet.length)];
    const exists = await tx.team.findUnique({ where: { joinCode: code } });
    if (!exists) return code;
  }
  throw new AppError(500, 'JOIN_CODE_FAILED', 'לא ניתן היה ליצור קוד צוות');
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw conflict('כתובת האימייל כבר רשומה במערכת', 'EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const userId = await prisma.$transaction(async (tx) => {
    if (input.role === 'TEAM_LEADER') {
      const leader = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
          role: 'TEAM_LEADER',
          hourlyRate: input.salary,
        },
      });
      const team = await tx.team.create({
        data: { name: input.teamName, joinCode: await generateJoinCode(tx), leaderId: leader.id },
      });
      await tx.user.update({ where: { id: leader.id }, data: { teamId: team.id } });
      return leader.id;
    }

    const team = await tx.team.findUnique({ where: { joinCode: input.joinCode } });
    if (!team) throw notFound('קוד הצוות לא נמצא — בדקו אותו מול ראש הצוות');
    const employee = await tx.user.create({
      data: { name: input.name, email: input.email, passwordHash, role: 'EMPLOYEE', teamId: team.id },
    });
    return employee.id;
  });

  return buildAuthResponse(userId);
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // Same message for unknown email and wrong password — don't reveal which emails exist.
  const valid = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
  if (!user || !valid) throw unauthorized('אימייל או סיסמה שגויים', 'INVALID_CREDENTIALS');
  return buildAuthResponse(user.id);
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: userWithTeam });
  if (!user) throw notFound();
  return toPublicUser(user);
}

async function buildAuthResponse(userId: number) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: userWithTeam });
  return { token: signToken(user), user: toPublicUser(user) };
}
