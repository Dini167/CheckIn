import type { Request, Response } from 'express';
import { currentUser } from '../../common/auth';
import { parse } from '../../common/validate';
import { loginSchema, registerSchema } from './auth.schemas';
import * as service from './auth.service';

export async function register(req: Request, res: Response) {
  const input = parse(registerSchema, req.body);
  res.status(201).json(await service.register(input));
}

export async function login(req: Request, res: Response) {
  const input = parse(loginSchema, req.body);
  res.json(await service.login(input));
}

export async function me(req: Request, res: Response) {
  res.json(await service.getMe(currentUser(req).id));
}
