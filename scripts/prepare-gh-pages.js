const { rimrafSync } = require('rimraf');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const gh = path.join(root, 'gh-pages');

fs.mkdirSync(gh, { recursive: true });
rimrafSync(path.join(gh, 'docs'));
rimrafSync(path.join(gh, 'demo'));
