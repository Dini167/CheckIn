import type { AppModule } from '../../common/module';
import { registerSickNotesDocs } from './sick-notes.openapi';
import { sickNotesRouter } from './sick-notes.routes';

export const sickNotesModule: AppModule = {
  name: 'sick-notes',
  basePath: '/sick-notes',
  router: sickNotesRouter,
  registerDocs: registerSickNotesDocs,
};
