import { Router } from 'express';
import { requireAuth, requireRole } from '../../common/auth';
import * as controller from './corrections.controller';

export const correctionsRouter = Router();

correctionsRouter.use(requireAuth);
correctionsRouter.get('/quota', controller.quota);
correctionsRouter.get('/mine', controller.mine);
correctionsRouter.post('/', controller.create);
correctionsRouter.get('/team', requireRole('TEAM_LEADER'), controller.team);
correctionsRouter.patch('/:id/review', requireRole('TEAM_LEADER'), controller.review);
