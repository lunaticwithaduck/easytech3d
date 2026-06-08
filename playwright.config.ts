import { defineConfig, devices } from '@playwright/test';

// Scaffold config: drives a dev server. For parity-grade checks against the captured
// reference, switch `command` to a production build (`pnpm build && pnpm start`).
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000/bg',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
