import { defineConfig } from 'rolldown';

export default defineConfig([
  {
    input: 'src/umd-entry.ts',
    output: {
      file: 'dist/main.umd.js',
      format: 'umd',
      name: 'GameGrid',
      exports: 'default',
      sourcemap: true,
      minify: true,
    },
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/main.js',
      format: 'es',
      sourcemap: true,
      minify: true,
    },
  },
]);
