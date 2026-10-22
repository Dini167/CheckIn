import { Router } from 'express';
import { requireAuth, requireRole } from '../../common/auth';
import * as controller from './team.controller';

export const teamRouter = Router();

teamRouter.use(requireAuth);
teamRouter.get('/', controller.getMyTeam);
teamRouter.get('/members', requireRole('TEAM_LEADER'), controller.listMembers);
teamRouter.patch('/members/:id/salary', requireRole('TEAM_LEADER'), controller.updateSalary);
