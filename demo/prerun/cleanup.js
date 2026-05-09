const { rimrafSync } = require('rimraf');

/**
 * Tear down Parcel artefacts only (keeps node_modules — use `demo:start`/`npm start` flows that run `npm install` + `npm link` when needed).
 */
function cleanup() {
  rimrafSync('dist');
  rimrafSync('.parcel-cache');
  rimrafSync('src/output.html');
}

cleanup();
