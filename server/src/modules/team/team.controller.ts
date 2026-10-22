import type { Request, Response } from 'express';
import { currentUser } from '../../common/auth';
import { parse, parseId } from '../../common/validate';
import { salarySchema, membersQuerySchema } from './team.schemas';
import * as service from './team.service';

export async function getMyTeam(req: Request, res: Response) {
  res.json(await service.getMyTeam(currentUser(req)));
}

export async function listMembers(req: Request, res: Response) {
  const query = parse(membersQuerySchema, req.query);
  res.json(await service.listMembers(currentUser(req), query.missingSalary ?? false));
}

export async function updateSalary(req: Request, res: Response) {
  const { salary } = parse(salarySchema, req.body);
  res.json(await service.updateSalary(currentUser(req), parseId(req.params.id), salary));
}
