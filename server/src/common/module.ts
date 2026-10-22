import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import type { Router } from 'express';

/**
 * A feature module. Each module is self-contained: its own routes, logic, validation and docs.
 * Modules are switched on/off in one place — the list in src/modules/index.ts.
 */
export interface AppModule {
  /** Name used in logs and as the Swagger tag. */
  name: string;
  /** Mounted under /api + basePath. */
  basePath: string;
  router: Router;
  /** Registers this module's endpoints in Swagger. */
  registerDocs?: (registry: OpenAPIRegistry) => void;
  /** Optional startup hook (for example subscribing to events from other modules). */
  init?: () => void;
}
