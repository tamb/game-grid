const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("@rollup/plugin-typescript");
const postcss = require("rollup-plugin-postcss");

module.exports = {
  input: "src/index.ts",
  output: {
    file: "dist/main.js",
    format: "umd",
    name: "GameGrid",
  },
  plugins: [resolve(), commonjs(), typescript(), postcss()],
};
