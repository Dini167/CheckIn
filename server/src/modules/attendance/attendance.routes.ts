import { Router } from 'express';
import { requireAuth, requireRole } from '../../common/auth';
import * as controller from './attendance.controller';

export const attendanceRouter = Router();

attendanceRouter.use(requireAuth);
attendanceRouter.get('/today', controller.today);
attendanceRouter.post('/clock-in', controller.clockIn);
attendanceRouter.post('/pause', controller.pause);
attendanceRouter.post('/clock-out', controller.clockOut);
attendanceRouter.get('/calendar', controller.calendar);
attendanceRouter.get('/missing', controller.missing);
attendanceRouter.get('/team', requireRole('TEAM_LEADER'), controller.team);
attendanceRouter.get('/team/now', requireRole('TEAM_LEADER'), controller.teamNow);
