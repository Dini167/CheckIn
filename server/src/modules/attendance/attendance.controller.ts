import type { Request, Response } from 'express';
import { currentUser } from '../../common/auth';
import { parse } from '../../common/validate';
import {
  clockInSchema,
  clockOutSchema,
  monthQuerySchema,
  pauseSchema,
  teamAttendanceQuerySchema,
} from './attendance.schemas';
import * as service from './attendance.service';

export async function today(req: Request, res: Response) {
  res.json(await service.getToday(currentUser(req)));
}

export async function clockIn(req: Request, res: Response) {
  const { location, remarks } = parse(clockInSchema, req.body);
  res.status(201).json(await service.clockIn(currentUser(req), location, remarks));
}

export async function pause(req: Request, res: Response) {
  const { remarks } = parse(pauseSchema, req.body ?? {});
  res.json(await service.pause(currentUser(req), remarks));
}

export async function clockOut(req: Request, res: Response) {
  const { dailySummary, remarks } = parse(clockOutSchema, req.body);
  res.json(await service.clockOut(currentUser(req), dailySummary, remarks));
}

export async function calendar(req: Request, res: Response) {
  const { month } = parse(monthQuerySchema, req.query);
  res.json(await service.getCalendar(currentUser(req), month));
}

export async function missing(req: Request, res: Response) {
  const { month } = parse(monthQuerySchema, req.query);
  res.json(await service.getMissing(currentUser(req), month));
}

export async function team(req: Request, res: Response) {
  const query = parse(teamAttendanceQuerySchema, req.query);
  res.json(await service.getTeamAttendance(currentUser(req), query));
}

export async function teamNow(req: Request, res: Response) {
  res.json(await service.getTeamNow(currentUser(req)));
}
