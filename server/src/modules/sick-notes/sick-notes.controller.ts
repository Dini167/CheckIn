import type { Request, Response } from 'express';
import { currentUser } from '../../common/auth';
import { parse, parseId } from '../../common/validate';
import { createSickNoteSchema, reviewSchema, teamQuerySchema } from './sick-notes.schemas';
import * as service from './sick-notes.service';

export async function create(req: Request, res: Response) {
  const input = parse(createSickNoteSchema, req.body ?? {});
  res.status(201).json(await service.createSickNote(currentUser(req), input, req.file));
}

export async function mine(req: Request, res: Response) {
  res.json(await service.listMine(currentUser(req)));
}

export async function team(req: Request, res: Response) {
  const { status } = parse(teamQuerySchema, req.query);
  res.json(await service.listTeam(currentUser(req), status));
}

export async function file(req: Request, res: Response) {
  const note = await service.getFile(currentUser(req), parseId(req.params.id));
  res.setHeader('Content-Type', note.mimeType);
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(note.fileName)}`);
  res.setHeader('Cache-Control', 'private, no-store');
  res.send(Buffer.from(note.fileData));
}

export async function review(req: Request, res: Response) {
  const { decision } = parse(reviewSchema, req.body);
  res.json(await service.review(currentUser(req), parseId(req.params.id), decision));
}
