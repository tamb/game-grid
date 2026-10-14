import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

/**
 * Real-browser suite. Not part of `npm test`.
 * Run with `npm run test:e2e`.
 *
 * Playwright drives Chromium headlessly; clicks and keystrokes are not
 * synthetic jsdom events.
 */
export default defineConfig({
  test: {
    include: ['e2e/**/*.e2e.test.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
