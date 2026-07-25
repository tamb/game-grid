const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const gh = path.join(root, 'gh-pages');

fs.mkdirSync(gh, { recursive: true });
fs.rmSync(path.join(gh, 'docs'), { recursive: true, force: true });
fs.rmSync(path.join(gh, 'demo'), { recursive: true, force: true });
