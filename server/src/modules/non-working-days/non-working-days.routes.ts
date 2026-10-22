import { Router } from 'express';
import { requireAuth, requireRole } from '../../common/auth';
import * as controller from './non-working-days.controller';

export const nonWorkingDaysRouter = Router();

nonWorkingDaysRouter.use(requireAuth);
nonWorkingDaysRouter.get('/', controller.list);
nonWorkingDaysRouter.post('/', requireRole('TEAM_LEADER'), controller.create);
nonWorkingDaysRouter.patch('/:id', requireRole('TEAM_LEADER'), controller.update);
nonWorkingDaysRouter.delete('/:id', requireRole('TEAM_LEADER'), controller.remove);
