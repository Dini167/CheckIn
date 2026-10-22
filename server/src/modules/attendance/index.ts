import type { AppModule } from '../../common/module';
import { registerAttendanceDocs } from './attendance.openapi';
import { attendanceRouter } from './attendance.routes';

export const attendanceModule: AppModule = {
  name: 'attendance',
  basePath: '/attendance',
  router: attendanceRouter,
  registerDocs: registerAttendanceDocs,
};
