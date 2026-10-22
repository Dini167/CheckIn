import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type EmbeddedPostgres from 'embedded-postgres' with { 'resolution-mode': 'import' };
import { embeddedPgInitFlags } from '../scripts/embedded-pg-flags';

const TEST_PORT = 54329;

/** Starts a throw-away PostgreSQL and applies the real Prisma migrations to it. */
export default async function setup() {
  const url = process.env.TEST_DATABASE_URL ?? `postgresql://postgres:postgres@localhost:${TEST_PORT}/attendance_test`;
  let pg: EmbeddedPostgres | null = null;
  let dataDir: string | null = null;

  if (!process.env.TEST_DATABASE_URL) {
    dataDir = mkdtempSync(path.join(os.tmpdir(), 'attendance-test-db-'));
    // embedded-postgres is an ES module, so it is loaded with import().
    const { default: Postgres } = await import('embedded-postgres');
    pg = new Postgres({
      databaseDir: dataDir,
      user: 'postgres',
      password: 'postgres',
      port: TEST_PORT,
      persistent: false,
      initdbFlags: embeddedPgInitFlags(),
      onLog: () => {},
    });
    await pg.initialise();
    await pg.start();
    await pg.createDatabase('attendance_test');
  }

  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe',
  });

  return async () => {
    if (pg) await pg.stop();
    if (dataDir) rmSync(dataDir, { recursive: true, force: true });
  };
}
