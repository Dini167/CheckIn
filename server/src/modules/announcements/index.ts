import type { AppModule } from '../../common/module';
import { registerAnnouncementsDocs } from './announcements.openapi';
import { announcementsRouter } from './announcements.routes';

export const announcementsModule: AppModule = {
  name: 'announcements',
  basePath: '/announcements',
  router: announcementsRouter,
  registerDocs: registerAnnouncementsDocs,
};
