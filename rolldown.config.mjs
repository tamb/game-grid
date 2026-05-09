import { defineConfig } from 'rolldown';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/main.umd.js',
      format: 'umd',
      name: 'GameGrid',
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
