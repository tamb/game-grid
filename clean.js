const rimraf = require('rimraf');
const fs = require('fs');

function cleanup() {
  rimraf.sync('dist');

  const tgzFiles = fs
    .readdirSync('.')
    .filter((f) => f.match(/gamegrid.*\.tgz/gm));
  rimraf.sync(tgzFiles.map((f) => `./${f}`));
}

cleanup();
