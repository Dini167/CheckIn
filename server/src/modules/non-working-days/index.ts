import type { AppModule } from '../../common/module';
import { registerNonWorkingDaysDocs } from './non-working-days.openapi';
import { nonWorkingDaysRouter } from './non-working-days.routes';

export const nonWorkingDaysModule: AppModule = {
  name: 'non-working-days',
  basePath: '/non-working-days',
  router: nonWorkingDaysRouter,
  registerDocs: registerNonWorkingDaysDocs,
};
