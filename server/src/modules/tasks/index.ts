import type { AppModule } from '../../common/module';
import { registerTasksDocs } from './tasks.openapi';
import { tasksRouter } from './tasks.routes';

export const tasksModule: AppModule = {
  name: 'tasks',
  basePath: '/tasks',
  router: tasksRouter,
  registerDocs: registerTasksDocs,
};
