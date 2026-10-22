import type { AppModule } from '../../common/module';
import { registerAuthDocs } from './auth.openapi';
import { authRouter } from './auth.routes';

export const authModule: AppModule = {
  name: 'auth',
  basePath: '/auth',
  router: authRouter,
  registerDocs: registerAuthDocs,
};
