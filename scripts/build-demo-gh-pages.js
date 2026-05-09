/**
 * Build Parcel into demo/dist, then copy that folder into gh-pages/demo (predictable relative asset URLs).
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const demoDir = path.join(root, 'demo');
const distDir = path.join(demoDir, 'dist');
const outDir = path.join(root, 'gh-pages', 'demo');

execSync('node prerun/compile.js', { cwd: demoDir, stdio: 'inherit' });

execSync('npx parcel build src/output.html --dist-dir dist --public-url ./', {
  cwd: demoDir,
  stdio: 'inherit',
  shell: true,
});

fs.mkdirSync(path.join(root, 'gh-pages'), { recursive: true });
fs.rmSync(outDir, { recursive: true, force: true });
fs.cpSync(distDir, outDir, { recursive: true });
