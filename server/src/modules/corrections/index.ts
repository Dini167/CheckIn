import type { AppModule } from '../../common/module';
import { registerCorrectionsDocs } from './corrections.openapi';
import { correctionsRouter } from './corrections.routes';

export const correctionsModule: AppModule = {
  name: 'corrections',
  basePath: '/corrections',
  router: correctionsRouter,
  registerDocs: registerCorrectionsDocs,
};
