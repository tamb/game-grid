const rimraf = require('rimraf');

function cleanup() {
  rimraf.sync('dist');
  rimraf.sync('.parcel-cache');
  rimraf.sync('src/output.html');
  rimraf.sync('node_modules');
  rimraf.sync('package-lock.json');
}

cleanup();
