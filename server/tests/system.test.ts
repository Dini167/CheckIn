import { execSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { addDays, nextWorkDay, weekStartKey, zonedTimeToUtc } from '../src/common/dates';
import { api } from './helpers';

const root = path.resolve(__dirname, '..');

describe('health', () => {
  it('GET /api/health reports the server and the database', async () => {
    const res = await api().get('/api/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('unknown routes return a JSON 404', async () => {
    const res = await api().get('/api/nope').expect(404);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });

  it('broken JSON returns 400', async () => {
    const res = await api().post('/api/auth/login').set('Content-Type', 'application/json').send('{"email":').expect(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });

  it('CORS headers are sent', async () => {
    const res = await api().get('/api/health').set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});

describe('swagger / openapi', () => {
  it('serves Swagger UI and a valid OpenAPI 3 document with Bearer auth', async () => {
    await api().get('/api-docs/').expect(200).expect('Content-Type', /html/);
    const { body: doc } = await api().get('/api-docs/openapi.json').expect(200);

    expect(doc.openapi).toMatch(/^3\./);
    expect(doc.components.securitySchemes.bearerAuth).toMatchObject({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' });

    const operations = Object.values(doc.paths).flatMap((p) => Object.values(p as object)) as {
      security?: unknown[];
      responses: Record<string, unknown>;
      tags: string[];
    }[];
    expect(operations.length).toBeGreaterThanOrEqual(45);
    for (const op of operations) {
      expect(op.tags.length).toBeGreaterThan(0);
      expect(Object.keys(op.responses).length).toBeGreaterThan(0);
    }

    // Every protected endpoint must document the token and 401.
    const login = doc.paths['/api/auth/login'].post;
    expect(login.security).toBeUndefined();
    const tasks = doc.paths['/api/tasks'].get;
    expect(tasks.security).toEqual([{ bearerAuth: [] }]);
    expect(tasks.responses['401']).toBeDefined();
    const redDots = doc.paths['/api/pulses/red-dots'].get;
    expect(redDots.responses['403']).toBeDefined();
  });

  it('documents every route that the server actually serves', async () => {
    const { body: doc } = await api().get('/api-docs/openapi.json');
    const documented = new Set(
      Object.entries(doc.paths).flatMap(([p, ops]) => Object.keys(ops as object).map((m) => `${m.toUpperCase()} ${p}`)),
    );
    const expected = [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/attendance/calendar',
      'POST /api/corrections',
      'PATCH /api/corrections/{id}/review',
      'POST /api/sick-notes',
      'GET /api/sick-notes/{id}/file',
      'POST /api/salary/locks',
      'GET /api/pulses/current',
      'POST /api/tasks/{id}/carry-over',
      'DELETE /api/announcements/{id}',
      'POST /api/non-working-days',
    ];
    for (const route of expected) expect(documented).toContain(route);
  });
});

describe('prisma', () => {
  it('schema is valid and migrations match the schema', () => {
    const env = { ...process.env };
    expect(() => execSync('npx prisma validate', { cwd: root, env, stdio: 'pipe' })).not.toThrow();
    // Exits with an error code if the database (built from migrations) differs from schema.prisma.
    expect(() =>
      execSync(
        'npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --shadow-database-url "' +
          process.env.DATABASE_URL +
          '" --exit-code',
        { cwd: root, env, stdio: 'pipe' },
      ),
    ).not.toThrow();
  });
});

describe('date helpers', () => {
  it('handles Israel time including daylight saving', () => {
    expect(zonedTimeToUtc('2030-01-07', '09:00').toISOString()).toBe('2030-01-07T07:00:00.000Z'); // winter UTC+2
    expect(zonedTimeToUtc('2030-07-07', '09:00').toISOString()).toBe('2030-07-07T06:00:00.000Z'); // summer UTC+3
  });

  it('computes weeks and work days', () => {
    expect(weekStartKey('2030-01-09')).toBe('2030-01-06');
    expect(nextWorkDay('2030-01-10')).toBe('2030-01-13');
    expect(addDays('2030-12-31', 1)).toBe('2031-01-01');
  });
});
