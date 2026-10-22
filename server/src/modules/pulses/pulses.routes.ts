import { Router } from 'express';
import { requireAuth, requireRole } from '../../common/auth';
import * as controller from './pulses.controller';

export const pulsesRouter = Router();

pulsesRouter.use(requireAuth);
pulsesRouter.get('/current', controller.current);
pulsesRouter.get('/mine', controller.mine);
pulsesRouter.post('/:id/respond', controller.respond);
pulsesRouter.get('/red-dots', requireRole('TEAM_LEADER'), controller.redDots);
