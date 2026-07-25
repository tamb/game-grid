const fs = require('node:fs');

/**
 * Tear down Parcel artefacts only (keeps node_modules — run `npm run demo:install` from repo root when deps change).
 */
function cleanup() {
  fs.rmSync('dist', { recursive: true, force: true });
  fs.rmSync('.parcel-cache', { recursive: true, force: true });
  fs.rmSync('src/output.html', { force: true });
}

cleanup();
