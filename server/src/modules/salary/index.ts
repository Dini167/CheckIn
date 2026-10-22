import type { AppModule } from '../../common/module';
import { registerSalaryDocs } from './salary.openapi';
import { salaryRouter } from './salary.routes';

export const salaryModule: AppModule = {
  name: 'salary',
  basePath: '/salary',
  router: salaryRouter,
  registerDocs: registerSalaryDocs,
};
