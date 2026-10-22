import type { Request, Response } from 'express';
import { currentUser } from '../../common/auth';
import { parse } from '../../common/validate';
import { lockMonthSchema, monthQuerySchema } from './salary.schemas';
import * as service from './salary.service';

export async function mine(req: Request, res: Response) {
  const { month } = parse(monthQuerySchema, req.query);
  res.json(await service.getMySalary(currentUser(req), month));
}

export async function myHistory(req: Request, res: Response) {
  res.json(await service.getMyHistory(currentUser(req)));
}

export async function team(req: Request, res: Response) {
  const { month } = parse(monthQuerySchema, req.query);
  res.json(await service.getTeamPayroll(currentUser(req), month));
}

export async function lock(req: Request, res: Response) {
  const { month } = parse(lockMonthSchema, req.body);
  res.status(201).json(await service.lockMonth(currentUser(req), month));
}

export async function locks(req: Request, res: Response) {
  res.json(await service.listLocks(currentUser(req)));
}
