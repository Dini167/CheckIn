import type { AppModule } from '../../common/module';
import { on } from '../../common/events';
import { registerPulsesDocs } from './pulses.openapi';
import { pulsesRouter } from './pulses.routes';
import { scheduleDailyPulses } from './pulses.service';

export const pulsesModule: AppModule = {
  name: 'pulses',
  basePath: '/pulses',
  router: pulsesRouter,
  registerDocs: registerPulsesDocs,
  init() {
    on('clockIn', scheduleDailyPulses);
  },
};
