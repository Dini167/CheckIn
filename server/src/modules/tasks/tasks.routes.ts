import { Router } from 'express';
import { requireAuth } from '../../common/auth';
import * as controller from './tasks.controller';

export const tasksRouter = Router();

tasksRouter.use(requireAuth);
tasksRouter.get('/', controller.list);
tasksRouter.get('/plan', controller.plan);
tasksRouter.post('/', controller.create);
tasksRouter.patch('/:id', controller.update);
tasksRouter.delete('/:id', controller.remove);
tasksRouter.post('/:id/carry-over', controller.carryOver);
