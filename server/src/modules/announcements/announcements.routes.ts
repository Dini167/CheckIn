import { Router } from 'express';
import { requireAuth, requireRole } from '../../common/auth';
import * as controller from './announcements.controller';

export const announcementsRouter = Router();

announcementsRouter.use(requireAuth);
announcementsRouter.get('/', controller.list);
announcementsRouter.post('/', requireRole('TEAM_LEADER'), controller.create);
announcementsRouter.patch('/:id', requireRole('TEAM_LEADER'), controller.update);
announcementsRouter.delete('/:id', requireRole('TEAM_LEADER'), controller.remove);
