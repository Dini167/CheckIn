import type { Request, Response } from 'express';
import { currentUser } from '../../common/auth';
import { parse, parseId } from '../../common/validate';
import { createAnnouncementSchema, listQuerySchema, updateAnnouncementSchema } from './announcements.schemas';
import * as service from './announcements.service';

export async function list(req: Request, res: Response) {
  const { all } = parse(listQuerySchema, req.query);
  res.json(await service.list(currentUser(req), all ?? false));
}

export async function create(req: Request, res: Response) {
  const input = parse(createAnnouncementSchema, req.body);
  res.status(201).json(await service.create(currentUser(req), input));
}

export async function update(req: Request, res: Response) {
  const input = parse(updateAnnouncementSchema, req.body);
  res.json(await service.update(currentUser(req), parseId(req.params.id), input));
}

export async function remove(req: Request, res: Response) {
  await service.remove(currentUser(req), parseId(req.params.id));
  res.status(204).end();
}
