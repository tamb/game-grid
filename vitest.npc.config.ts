import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/npc/__tests__/**/*.ts'],
    exclude: ['src/npc/__tests__/**/*.dist.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/npc/**/*.ts'],
      exclude: ['src/npc/**/__tests__/**'],
      reporter: ['text', 'json-summary'],
      thresholds: {
        lines: 92,
        functions: 92,
        branches: 92,
        statements: 92,
      },
    },
  },
});
