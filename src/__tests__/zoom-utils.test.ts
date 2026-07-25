import type { IRegionTile } from '../interfaces';
import {
  clampCoordsToZoom,
  getAdjacentRegion,
  getMatrixHeight,
  getMatrixWidth,
  getRegionAt,
  isInsideZoom,
  normalizeZoomBounds,
  regionsEqual,
  resolveAnimate,
} from '../zoom';

const open = { type: 'open' as const };

describe('zoom pure helpers', () => {
  test('getMatrixWidth and getMatrixHeight handle jagged rows', () => {
    const matrix = [[open, open], [open]];
    expect(getMatrixWidth(matrix)).toBe(2);
    expect(getMatrixHeight(matrix)).toBe(2);
  });

  test('normalizeZoomBounds clips to matrix and rejects empty matrix', () => {
    const matrix = [
      [open, open, open],
      [open, open, open],
    ];
    expect(normalizeZoomBounds({ minX: -2, minY: 0, maxX: 10, maxY: 1 }, matrix)).toEqual({
      minX: 0,
      minY: 0,
      maxX: 2,
      maxY: 1,
    });
    expect(() => normalizeZoomBounds({ minX: 0, minY: 0, maxX: 1, maxY: 1 }, [])).toThrow(
      'Cannot normalize zoom bounds for empty matrix',
    );
  });

  test('clampCoordsToZoom and isInsideZoom respect bounds', () => {
    const zoom = { minX: 2, minY: 2, maxX: 4, maxY: 4 };
    expect(clampCoordsToZoom([0, 5], zoom)).toEqual([2, 4]);
    expect(isInsideZoom([3, 3], zoom)).toBe(true);
    expect(isInsideZoom([1, 3], zoom)).toBe(false);
  });

  test('resolveAnimate prefers per-call option then global default', () => {
    expect(resolveAnimate({ animate: true }, false)).toBe(true);
    expect(resolveAnimate({ animate: false }, true)).toBe(false);
    expect(resolveAnimate(undefined, true)).toBe(true);
    expect(resolveAnimate(undefined, undefined)).toBe(false);
  });

  test('regionsEqual compares tile indices only', () => {
    const a: IRegionTile = { divisions: 2, tileX: 0, tileY: 0, quadrant: 'nw' };
    const b: IRegionTile = { divisions: 2, tileX: 0, tileY: 0, quadrant: 'nw' };
    const c: IRegionTile = { divisions: 2, tileX: 1, tileY: 0, quadrant: 'ne' };
    expect(regionsEqual(a, b)).toBe(true);
    expect(regionsEqual(a, c)).toBe(false);
  });

  test('getRegionAt rejects divisions below 2', () => {
    expect(() => getRegionAt([[open]], [0, 0], 1)).toThrow('divisions must be >= 2');
  });
});

describe('getAdjacentRegion', () => {
  const nw = { divisions: 2, tileX: 0, tileY: 0, quadrant: 'nw' as const };

  test('returns adjacent tiles for all cardinals', () => {
    expect(getAdjacentRegion(nw, 'RIGHT')?.quadrant).toBe('ne');
    expect(getAdjacentRegion(nw, 'DOWN')?.quadrant).toBe('sw');
    expect(getAdjacentRegion(nw, 'UP')).toBeNull();
    expect(getAdjacentRegion(nw, 'LEFT')).toBeNull();
  });

  test('returns null for unknown direction', () => {
    expect(getAdjacentRegion(nw, 'DIAGONAL')).toBeNull();
  });
});
