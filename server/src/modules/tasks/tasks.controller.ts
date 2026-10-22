import type { Request, Response } from 'express';
import { currentUser } from '../../common/auth';
import { parse, parseId } from '../../common/validate';
import { createTaskSchema, listTasksQuerySchema, planQuerySchema, updateTaskSchema } from './tasks.schemas';
import * as service from './tasks.service';

export async function list(req: Request, res: Response) {
  const query = parse(listTasksQuerySchema, req.query);
  res.json(await service.listTasks(currentUser(req), query));
}

export async function create(req: Request, res: Response) {
  const input = parse(createTaskSchema, req.body);
  res.status(201).json(await service.createTask(currentUser(req), input));
}

export async function update(req: Request, res: Response) {
  const input = parse(updateTaskSchema, req.body);
  res.json(await service.updateTask(currentUser(req), parseId(req.params.id), input));
}

export async function remove(req: Request, res: Response) {
  await service.deleteTask(currentUser(req), parseId(req.params.id));
  res.status(204).end();
}

export async function carryOver(req: Request, res: Response) {
  res.json(await service.carryOver(currentUser(req), parseId(req.params.id)));
}

export async function plan(req: Request, res: Response) {
  const { date } = parse(planQuerySchema, req.query);
  res.json(await service.getPlan(currentUser(req), date));
}
