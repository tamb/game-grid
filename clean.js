const fs = require('node:fs');

function cleanup() {
  fs.rmSync('dist', { recursive: true, force: true });

  const tgzFiles = fs.readdirSync('.').filter((f) => f.match(/gamegrid.*\.tgz/gm));
  for (const f of tgzFiles) {
    fs.rmSync(`./${f}`, { force: true });
  }
}

cleanup();
