const { rimrafSync } = require('rimraf');

function cleanup() {
  rimrafSync('dist');
  rimrafSync('.parcel-cache');
  rimrafSync('src/output.html');
  rimrafSync('node_modules');
  rimrafSync('package-lock.json');
}

cleanup();
