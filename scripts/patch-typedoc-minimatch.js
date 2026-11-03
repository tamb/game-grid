/**
 * TypeDoc 0.28 calls Minimatch#matchOne, which minimatch 11 removed.
 * The override in package.json installs the patched minimatch, so map that
 * call onto Minimatch#match before generating docs.
 */
const fs = require('node:fs');
const path = require('node:path');

const target = path.join(__dirname, '..', 'node_modules', 'typedoc', 'dist', 'node-utils.js');
const patched = 'return mini.match(childPath.join("/"), true);';
const matchOneCall =
  /return mini\.set\.some\(\(row\) => mini\.matchOne\(\s*childPath,\s*row,\s*(?:\/\* partial \*\/\s*)?true\s*\)\);/;

const source = fs.readFileSync(target, 'utf8');

if (source.includes(patched)) {
  process.exit(0);
}

if (!matchOneCall.test(source)) {
  console.error(
    'TypeDoc no longer calls Minimatch#matchOne. Check the minimatch override in package.json before generating docs.',
  );
  process.exit(1);
}

fs.writeFileSync(target, source.replace(matchOneCall, patched));
