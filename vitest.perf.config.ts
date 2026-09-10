import { defineConfig } from 'vitest/config';

/**
 * Isolated performance / stress suite.
 *
 * Not part of `npm test`. Run with `npm run test:perf`.
 * Budgets are regression ceilings (ms) with CI headroom; they should fail if
 * active-cell painting or other hot paths revert to full-grid scans.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/__perf__/**/*.perf.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
    maxWorkers: 1,
  },
});
