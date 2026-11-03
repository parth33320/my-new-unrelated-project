import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'https://my-new-unrelated-project.onrender.com',
    headless: true,
    video: 'on',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
  ...(process.env.PLAYWRIGHT_BASE_URL && process.env.PLAYWRIGHT_BASE_URL.includes('localhost')
    ? {
        webServer: {
          command: 'NODE_ENV=production PORT=3001 npm start',
          port: 3001,
          reuseExistingServer: true,
        },
      }
    : {}),
});
