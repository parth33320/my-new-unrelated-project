import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/google-chrome',
    },
  },
  webServer: {
    command: 'NODE_ENV=production PORT=3001 npm start',
    port: 3001,
    reuseExistingServer: true,
  },
});
