import { Router } from 'express';
import { requireAuth, requireRole } from '../../common/auth';
import * as controller from './salary.controller';

export const salaryRouter = Router();

salaryRouter.use(requireAuth);
salaryRouter.get('/me', controller.mine);
salaryRouter.get('/me/history', controller.myHistory);
salaryRouter.get('/team', requireRole('TEAM_LEADER'), controller.team);
salaryRouter.get('/locks', requireRole('TEAM_LEADER'), controller.locks);
salaryRouter.post('/locks', requireRole('TEAM_LEADER'), controller.lock);
