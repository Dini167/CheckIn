import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { corsOrigins } from './config/env';
import { errorHandler, notFoundHandler } from './common/errors';
import { clearEventHandlers } from './common/events';
import type { AppModule } from './common/module';
import { buildOpenApiDocument } from './common/openapi';
import { modules as defaultModules } from './modules';

export function createApp(modules: AppModule[] = defaultModules): Express {
  const app = express();

  // Render and similar hosts sit behind a proxy.
  app.set('trust proxy', 1);
  // Swagger UI needs inline assets, and this server only returns JSON, so CSP is not needed.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: corsOrigins === '*' ? true : corsOrigins,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  // Modules subscribe to events in init(); start clean so creating the app twice never doubles handlers.
  clearEventHandlers();
  for (const m of modules) {
    m.init?.();
    app.use(`/api${m.basePath}`, m.router);
  }

  const openApiDocument = buildOpenApiDocument(modules);
  app.get('/api-docs/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: 'נוכחות+ API',
      swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
    }),
  );
  app.get('/', (_req, res) => {
    res.redirect('/api-docs');
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
