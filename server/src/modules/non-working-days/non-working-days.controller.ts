import type { Request, Response } from 'express';
import { currentUser } from '../../common/auth';
import { parse, parseId } from '../../common/validate';
import { createDaysSchema, listQuerySchema, updateDaySchema } from './non-working-days.schemas';
import * as service from './non-working-days.service';

export async function list(req: Request, res: Response) {
  const { month } = parse(listQuerySchema, req.query);
  res.json(await service.list(currentUser(req), month));
}

export async function create(req: Request, res: Response) {
  const input = parse(createDaysSchema, req.body);
  res.status(201).json(await service.create(currentUser(req), input));
}

export async function update(req: Request, res: Response) {
  const input = parse(updateDaySchema, req.body);
  res.json(await service.update(currentUser(req), parseId(req.params.id), input));
}

export async function remove(req: Request, res: Response) {
  await service.remove(currentUser(req), parseId(req.params.id));
  res.status(204).end();
}
