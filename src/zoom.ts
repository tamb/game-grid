import type { ICell, IRegionTile, IZoomBounds, IZoomOptions, ZoomQuadrant } from './interfaces';

export function getMatrixWidth(matrix: ICell[][]): number {
  return matrix.reduce((max, row) => Math.max(max, row.length), 0);
}

export function getMatrixHeight(matrix: ICell[][]): number {
  return matrix.length;
}

export function normalizeZoomBounds(bounds: IZoomBounds, matrix: ICell[][]): IZoomBounds {
  const h = getMatrixHeight(matrix);
  const w = getMatrixWidth(matrix);
  if (h === 0 || w === 0) {
    throw new Error('Cannot normalize zoom bounds for empty matrix');
  }

  const minX = Math.max(0, Math.min(bounds.minX, w - 1));
  const minY = Math.max(0, Math.min(bounds.minY, h - 1));
  const maxX = Math.max(minX, Math.min(bounds.maxX, w - 1));
  const maxY = Math.max(minY, Math.min(bounds.maxY, h - 1));

  if (maxX < minX || maxY < minY) {
    throw new Error('Invalid zoom bounds after normalization');
  }

  return { minX, minY, maxX, maxY };
}

export function clampCoordsToZoom(
  coords: readonly [number, number] | number[],
  zoom: IZoomBounds,
): [number, number] {
  const x = coords[0];
  const y = coords[1];
  return [Math.min(Math.max(x, zoom.minX), zoom.maxX), Math.min(Math.max(y, zoom.minY), zoom.maxY)];
}

export function isInsideZoom(
  coords: readonly [number, number] | number[],
  zoom: IZoomBounds,
): boolean {
  const x = coords[0];
  const y = coords[1];
  return x >= zoom.minX && x <= zoom.maxX && y >= zoom.minY && y <= zoom.maxY;
}

export function resolveAnimate(
  options: IZoomOptions | undefined,
  animateZoom: boolean | undefined,
): boolean {
  return options?.animate ?? animateZoom ?? false;
}

function getTileBounds(
  total: number,
  divisions: number,
  tileIndex: number,
): { start: number; end: number } {
  if (total <= 0) {
    return { start: 0, end: 0 };
  }

  const base = Math.floor(total / divisions);
  let start = 0;
  for (let i = 0; i < tileIndex; i++) {
    start += base;
  }

  const isLast = tileIndex === divisions - 1;
  const end = isLast ? total - 1 : start + base - 1;
  return { start, end };
}

export function getZoomAround(
  matrix: ICell[][],
  center: readonly [number, number] | number[],
  radiusX: number,
  radiusY?: number,
): IZoomBounds {
  if (radiusX < 0) {
    throw new Error('radiusX must be non-negative');
  }

  const ry = radiusY ?? radiusX;
  if (ry < 0) {
    throw new Error('radiusY must be non-negative');
  }

  const cx = center[0];
  const cy = center[1];

  return normalizeZoomBounds(
    {
      minX: cx - radiusX,
      minY: cy - ry,
      maxX: cx + radiusX,
      maxY: cy + ry,
    },
    matrix,
  );
}

export function getFractionZoom(
  matrix: ICell[][],
  divisions: number,
  tileX: number,
  tileY: number,
): IZoomBounds {
  if (divisions < 2) {
    throw new Error('divisions must be >= 2');
  }
  if (tileX < 0 || tileX >= divisions || tileY < 0 || tileY >= divisions) {
    throw new Error('tile indices out of range');
  }

  const w = getMatrixWidth(matrix);
  const h = getMatrixHeight(matrix);
  const xBounds = getTileBounds(w, divisions, tileX);
  const yBounds = getTileBounds(h, divisions, tileY);

  return {
    minX: xBounds.start,
    minY: yBounds.start,
    maxX: xBounds.end,
    maxY: yBounds.end,
  };
}

const QUADRANT_TILES: Record<ZoomQuadrant, [number, number]> = {
  nw: [0, 0],
  ne: [1, 0],
  sw: [0, 1],
  se: [1, 1],
};

export function getQuadrantZoom(matrix: ICell[][], quadrant: ZoomQuadrant): IZoomBounds {
  const [tileX, tileY] = QUADRANT_TILES[quadrant];
  return getFractionZoom(matrix, 2, tileX, tileY);
}

function findTileIndex(coord: number, total: number, divisions: number): number {
  for (let i = 0; i < divisions; i++) {
    const { start, end } = getTileBounds(total, divisions, i);
    if (coord >= start && coord <= end) {
      return i;
    }
  }
  return Math.max(0, divisions - 1);
}

function tileToQuadrant(tileX: number, tileY: number): ZoomQuadrant {
  if (tileX === 0 && tileY === 0) return 'nw';
  if (tileX === 1 && tileY === 0) return 'ne';
  if (tileX === 0 && tileY === 1) return 'sw';
  return 'se';
}

export function getRegionAt(
  matrix: ICell[][],
  coords: readonly [number, number] | number[],
  divisions: number,
): IRegionTile {
  if (divisions < 2) {
    throw new Error('divisions must be >= 2');
  }

  const x = coords[0];
  const y = coords[1];
  const w = getMatrixWidth(matrix);
  const h = getMatrixHeight(matrix);
  const tileX = findTileIndex(x, w, divisions);
  const tileY = findTileIndex(y, h, divisions);
  const tile: IRegionTile = { divisions, tileX, tileY };

  if (divisions === 2) {
    tile.quadrant = tileToQuadrant(tileX, tileY);
  }

  return tile;
}

export function regionsEqual(a: IRegionTile, b: IRegionTile): boolean {
  return a.divisions === b.divisions && a.tileX === b.tileX && a.tileY === b.tileY;
}

function regionTileFromIndices(divisions: number, tileX: number, tileY: number): IRegionTile {
  const tile: IRegionTile = { divisions, tileX, tileY };
  if (divisions === 2) {
    tile.quadrant = tileToQuadrant(tileX, tileY);
  }
  return tile;
}

/** Adjacent region tile in a cardinal direction, or `null` at the partition edge. */
export function getAdjacentRegion(tile: IRegionTile, direction: string): IRegionTile | null {
  let { tileX, tileY, divisions } = tile;

  switch (direction) {
    case 'UP':
      tileY -= 1;
      break;
    case 'DOWN':
      tileY += 1;
      break;
    case 'LEFT':
      tileX -= 1;
      break;
    case 'RIGHT':
      tileX += 1;
      break;
    default:
      return null;
  }

  if (tileX < 0 || tileX >= divisions || tileY < 0 || tileY >= divisions) {
    return null;
  }

  return regionTileFromIndices(divisions, tileX, tileY);
}
