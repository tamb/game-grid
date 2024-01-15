const rimraf = require('rimraf');

// Remove the output directory before running the tests
rimraf.sync('dist');
rimraf.sync('.parcel-cache');
