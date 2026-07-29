import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/__tests__/**/*.ts'],
    exclude: ['src/**/__tests__/**/*.dist.test.ts'],
  },
});
