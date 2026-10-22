import { defineConfig } from 'vitest/config';

// Tests use their own real PostgreSQL (started by tests/global-setup.ts) on a separate port.
// To use another PostgreSQL instead, set TEST_DATABASE_URL.
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:54329/attendance_test';

export default defineConfig({
  test: {
    globalSetup: ['./tests/global-setup.ts'],
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    // All test files share one database, so they run one after another.
    fileParallelism: false,
    pool: 'forks',
    testTimeout: 30_000,
    hookTimeout: 120_000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: TEST_DATABASE_URL,
      JWT_SECRET: 'test-secret-that-is-long-enough-for-hs256-signing',
      JWT_EXPIRES_IN: '12h',
      CORS_ORIGINS: '*',
      APP_TIMEZONE: 'Asia/Jerusalem',
    },
  },
});
