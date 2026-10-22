import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env';
import { forbidden, unauthorized } from './errors';
import { prisma } from './prisma';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  teamId: number | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

interface TokenPayload {
  sub: string;
  role: Role;
}

export function signToken(user: { id: number; role: Role }): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Requires a valid "Authorization: Bearer <token>" header.
 * The user is always loaded from the database by the id inside the token —
 * never from ids sent by the client.
 */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw unauthorized('נדרשת התחברות (חסר Bearer Token)', 'TOKEN_MISSING');
  }

  let payload: TokenPayload;
  try {
    payload = jwt.verify(header.slice('Bearer '.length).trim(), env.JWT_SECRET) as TokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw unauthorized('תוקף ההתחברות פג, יש להתחבר מחדש', 'TOKEN_EXPIRED');
    }
    throw unauthorized('טוקן לא תקין', 'TOKEN_INVALID');
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, name: true, email: true, role: true, teamId: true },
  });
  if (!user) throw unauthorized('המשתמש לא קיים', 'TOKEN_INVALID');

  req.user = user;
  next();
};

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) throw unauthorized();
    if (!roles.includes(req.user.role)) throw forbidden();
    next();
  };
}

/** Returns the authenticated user (only use after requireAuth). */
export function currentUser(req: Express.Request): AuthUser {
  if (!req.user) throw unauthorized();
  return req.user;
}
