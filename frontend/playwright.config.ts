import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // The suite mutates one shared database, so the specs must not race.
  workers: 1,
  fullyParallel: false,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:3108',
    trace: 'retain-on-failure',
  },
});
