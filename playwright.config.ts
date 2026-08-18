import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  // Default expect timeout (5s) is too tight against `next dev`: the FIRST call
  // to a server action pays a one-time on-demand compilation cost that can
  // exceed 5s on a cold server (e.g. the first lead submit in landing-lead.spec).
  // 15s absorbs that cold-compile latency without weakening any assertion — the
  // condition being awaited is unchanged, only the patience for it.
  expect: { timeout: 15_000 },
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/login',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
