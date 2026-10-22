import type { AppModule } from '../../common/module';
import { registerTeamDocs } from './team.openapi';
import { teamRouter } from './team.routes';

export const teamModule: AppModule = {
  name: 'team',
  basePath: '/team',
  router: teamRouter,
  registerDocs: registerTeamDocs,
};
