import { Router } from 'express';
import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import type { AppModule } from '../../common/module';
import { documentEndpoint } from '../../common/openapi';
import { now } from '../../common/clock';
import { prisma } from '../../common/prisma';
import { z } from '../../common/zod';

const healthSchema = z
  .object({
    status: z.enum(['ok', 'degraded']).openapi({ example: 'ok' }),
    database: z.enum(['up', 'down']).openapi({ example: 'up' }),
    serverTime: z.string().openapi({ example: '2026-10-13T07:30:00.000Z' }),
    uptimeSeconds: z.number().openapi({ example: 120 }),
  })
  .openapi('Health');

const router = Router();

router.get('/', async (_req, res) => {
  let database: 'up' | 'down' = 'up';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = 'down';
  }
  res.status(database === 'up' ? 200 : 503).json({
    status: database === 'up' ? 'ok' : 'degraded',
    database,
    serverTime: now().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

function registerDocs(registry: OpenAPIRegistry) {
  documentEndpoint(registry, {
    method: 'get',
    path: '/api/health',
    tag: 'System — מערכת',
    summary: 'בדיקת בריאות השרת ומסד הנתונים',
    description: 'מחזיר 503 אם אין חיבור למסד הנתונים.',
    access: 'public',
    success: { status: 200, description: 'השרת פעיל', schema: healthSchema },
  });
}

export const healthModule: AppModule = { name: 'health', basePath: '/health', router, registerDocs };
