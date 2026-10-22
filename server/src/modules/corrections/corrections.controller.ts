import type { Request, Response } from 'express';
import { currentUser } from '../../common/auth';
import { parse, parseId } from '../../common/validate';
import { createCorrectionSchema, reviewSchema, teamCorrectionsQuerySchema } from './corrections.schemas';
import * as service from './corrections.service';

export async function quota(req: Request, res: Response) {
  res.json(await service.getQuota(currentUser(req)));
}

export async function create(req: Request, res: Response) {
  const input = parse(createCorrectionSchema, req.body);
  res.status(201).json(await service.createCorrection(currentUser(req), input));
}

export async function mine(req: Request, res: Response) {
  res.json(await service.listMine(currentUser(req)));
}

export async function team(req: Request, res: Response) {
  const query = parse(teamCorrectionsQuerySchema, req.query);
  res.json(await service.listTeam(currentUser(req), query));
}

export async function review(req: Request, res: Response) {
  const { decision } = parse(reviewSchema, req.body);
  res.json(await service.review(currentUser(req), parseId(req.params.id), decision));
}
