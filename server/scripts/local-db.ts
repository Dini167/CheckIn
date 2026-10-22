/**
 * Starts a real PostgreSQL server on this computer — no installation needed.
 * Data is kept in ./.local-db between runs. Stop with Ctrl+C.
 *
 *   npm run db:local
 *   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/attendance
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { embeddedPgInitFlags } from './embedded-pg-flags';

const PORT = Number(process.env.LOCAL_DB_PORT ?? 5433);
const DB_NAME = 'attendance';
const dataDir = path.resolve(__dirname, '..', '.local-db');

async function main() {
  // embedded-postgres is an ES module, so it is loaded with import().
  const { default: EmbeddedPostgres } = await import('embedded-postgres');
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password: 'postgres',
    port: PORT,
    persistent: true,
    initdbFlags: embeddedPgInitFlags(),
  });

  if (!existsSync(path.join(dataDir, 'PG_VERSION'))) {
    console.log('Creating a new local database folder...');
    await pg.initialise();
  }
  await pg.start();
  try {
    await pg.createDatabase(DB_NAME);
    console.log(`Created database "${DB_NAME}"`);
  } catch {
    // Already exists.
  }

  console.log(`\n✅ PostgreSQL is running on port ${PORT}`);
  console.log(`   DATABASE_URL=postgresql://postgres:postgres@localhost:${PORT}/${DB_NAME}`);
  console.log('   Keep this window open. Press Ctrl+C to stop.\n');

  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on('SIGINT', () => void stop());
  process.on('SIGTERM', () => void stop());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
