const rimraf = require('rimraf');

module.exports = function cleanup() {
  rimraf.sync('dist');
  rimraf.sync('.parcel-cache');
  rimraf.sync('src/output.html');
};
