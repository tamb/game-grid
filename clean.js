const { rimrafSync } = require('rimraf');
const fs = require('node:fs');

function cleanup() {
  rimrafSync('dist');

  const tgzFiles = fs.readdirSync('.').filter((f) => f.match(/gamegrid.*\.tgz/gm));
  for (const f of tgzFiles) {
    rimrafSync(`./${f}`);
  }
}

cleanup();
