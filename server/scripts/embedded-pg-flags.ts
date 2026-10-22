import path from 'node:path';

/**
 * initdb flags for the local/test PostgreSQL.
 *
 * We want UTF-8, but PostgreSQL on Windows fails to create a UTF-8 database when its own
 * files live under a non-English folder name (e.g. "תכנות לימודים"). In that case we keep
 * the Windows default encoding, which still supports Hebrew. Cloud databases are always UTF-8.
 */
export function embeddedPgInitFlags(): string[] {
  const projectDir = path.resolve(__dirname, '..');
  const asciiPath = /^[\x20-\x7E]*$/.test(projectDir);
  if (!asciiPath && process.platform === 'win32') {
    console.warn('ℹ️  Project folder name is not in English — local database uses the Windows encoding (Hebrew works).');
    return [];
  }
  return ['--encoding=UTF8', '--locale=C'];
}
