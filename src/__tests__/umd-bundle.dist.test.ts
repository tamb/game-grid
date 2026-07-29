import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const umdPath = resolve(import.meta.dirname, '../../dist/main.umd.js');

describe('UMD bundle', () => {
  if (!existsSync(umdPath)) {
    it.skip('requires dist/main.umd.js (run npm run build first)', () => {});
    return;
  }

  it('exposes the GameGrid constructor and named exports without .default', () => {
    const umd = readFileSync(umdPath, 'utf8');
    const sandbox: { GameGrid?: Record<string, unknown> & (new () => unknown) } = {};
    vm.runInNewContext(umd, sandbox, { filename: 'main.umd.js' });

    expect(typeof sandbox.GameGrid).toBe('function');
    expect(sandbox.GameGrid).toHaveProperty('gridEventsEnum');
    expect(sandbox.GameGrid).toHaveProperty('cellTypeEnum');
    expect(sandbox.GameGrid).not.toHaveProperty('default');
  });
});
