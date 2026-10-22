import type { AppModule } from '../common/module';
import { healthModule } from './health';
import { authModule } from './auth';
import { teamModule } from './team';
import { attendanceModule } from './attendance';
import { tasksModule } from './tasks';
import { pulsesModule } from './pulses';
import { correctionsModule } from './corrections';
import { sickNotesModule } from './sick-notes';
import { salaryModule } from './salary';
import { nonWorkingDaysModule } from './non-working-days';
import { announcementsModule } from './announcements';

/**
 * ⭐ The list of active features.
 * To REMOVE a feature: delete its line here (and, if you want, its folder in src/modules).
 * To ADD a feature: create a folder with an index.ts that exports an AppModule and add it here.
 */
export const modules: AppModule[] = [
  healthModule, //          /api/health
  authModule, //            /api/auth
  teamModule, //            /api/team
  attendanceModule, //      /api/attendance
  tasksModule, //           /api/tasks
  pulsesModule, //          /api/pulses
  correctionsModule, //     /api/corrections
  sickNotesModule, //       /api/sick-notes
  salaryModule, //          /api/salary
  nonWorkingDaysModule, //  /api/non-working-days
  announcementsModule, //   /api/announcements
];
