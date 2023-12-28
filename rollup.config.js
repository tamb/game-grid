const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');

module.exports = {
  input: 'src/index.ts',
  output: {
    file: 'dist/main.js',
    format: 'umd',
    name: 'GameGrid',
    sourcemap: true,
  },
  plugins: [resolve(), commonjs(), typescript(), terser()],
};
