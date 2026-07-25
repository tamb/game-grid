import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('package manifest', () => {
  it('exposes a source entry so the Parcel demo can bundle without a prebuilt dist/', () => {
    const pkg = JSON.parse(
      readFileSync(resolve(import.meta.dirname, '../../package.json'), 'utf8'),
    ) as { source?: string };

    expect(pkg.source).toBe('src/index.ts');
  });
});
