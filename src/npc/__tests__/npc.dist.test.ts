import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const bundle = resolve(import.meta.dirname, '../../../dist/npc/index.js');

describe('npc bundle', () => {
  if (!existsSync(bundle)) {
    it.skip('requires dist/npc/index.js (run npm run build first)', () => {});
    return;
  }

  it('blocks a type other than barrier', async () => {
    const { walkableUnlessTypes } = (await import(pathToFileURL(bundle).href)) as {
      walkableUnlessTypes: (
        blocked: string[],
      ) => (matrix: { type: string }[][], x: number, y: number) => boolean;
    };
    const matrix = [
      [{ type: 'floor' }, { type: 'wall' }],
      [{ type: 'barrier' }, { type: 'water' }],
    ];
    const isWalkable = walkableUnlessTypes(['wall', 'water']);
    expect(isWalkable(matrix, 0, 0)).toBe(true);
    expect(isWalkable(matrix, 0, 1)).toBe(true);
    expect(isWalkable(matrix, 1, 0)).toBe(false);
    expect(isWalkable(matrix, 1, 1)).toBe(false);
  });
});
