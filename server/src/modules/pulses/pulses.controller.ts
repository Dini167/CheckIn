import type { Request, Response } from 'express';
import { currentUser } from '../../common/auth';
import { parse, parseId } from '../../common/validate';
import { myPulsesQuerySchema, redDotsQuerySchema, respondSchema } from './pulses.schemas';
import * as service from './pulses.service';

export async function current(req: Request, res: Response) {
  res.json(await service.getCurrent(currentUser(req)));
}

export async function respond(req: Request, res: Response) {
  const { responseText } = parse(respondSchema, req.body);
  res.json(await service.respond(currentUser(req), parseId(req.params.id), responseText));
}

export async function mine(req: Request, res: Response) {
  const { date } = parse(myPulsesQuerySchema, req.query);
  res.json(await service.listMine(currentUser(req), date));
}

export async function redDots(req: Request, res: Response) {
  const { from, to } = parse(redDotsQuerySchema, req.query);
  res.json(await service.getRedDots(currentUser(req), from, to ?? from));
}
