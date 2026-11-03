import { chebyshev, coordKey, DIRECTIONS, directionOf } from './geom';
import type { Cell, Coord, Direction, IsWalkable } from './types';

/**
 * First step of a shortest walk from `from` to `to`.
 * Returns null when the target is the start cell or no walk exists.
 * Greedy axis steps are not used: beside a long wall they step toward the
 * target and then reverse.
 *
 * @param matrix - Board the walk is planned on.
 * @param isWalkable - Which cells may be entered. Also blocks cells the caller wants skipped.
 * @param from - Start coordinate.
 * @param to - Target coordinate.
 * @returns The first direction, or null.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * import { bfsNextStep, walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const matrix = [
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }],
 *   [{ type: "wall" }, { type: "floor" }, { type: "floor" }],
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }],
 * ];
 * const isWalkable = walkableUnlessTypes(["wall"]);
 * const toward = bfsNextStep(matrix, isWalkable, [1, 1], [2, 1]);
 * ```
 */
function bfsNextStep(
  matrix: Cell[][],
  isWalkable: IsWalkable,
  from: Coord,
  to: Coord,
): Direction | null {
  if (from[0] === to[0] && from[1] === to[1]) return null;

  const queue: Coord[] = [from];
  const cameFrom = new Map<string, string | null>();
  cameFrom.set(coordKey(from), null);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    const key = coordKey(current);

    if (current[0] === to[0] && current[1] === to[1]) {
      let step = key;
      let prev = cameFrom.get(step) ?? null;
      while (prev && prev !== coordKey(from)) {
        step = prev;
        prev = cameFrom.get(step) ?? null;
      }
      if (step === coordKey(from)) return null;
      const [sx, sy] = from;
      const [tx, ty] = step.split(',').map(Number) as [number, number];
      return directionOf(tx - sx, ty - sy);
    }

    const [x, y] = current;
    for (const [, [dx, dy]] of DIRECTIONS) {
      const nx = x + dx;
      const ny = y + dy;
      const nextKey = coordKey([nx, ny]);
      if (!isWalkable(matrix, nx, ny)) continue;
      if (cameFrom.has(nextKey)) continue;
      cameFrom.set(nextKey, key);
      queue.push([nx, ny]);
    }
  }

  return null;
}

/**
 * First step of a walk that ends on a cell as far from `avoid` as the board allows.
 *
 * @param matrix - Board the walk is planned on.
 * @param isWalkable - Which cells may be entered.
 * @param from - Start coordinate.
 * @param avoid - Coordinate to move away from.
 * @returns The first direction, or null when no step exists.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * import { bfsFarthestStep, walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const isWalkable = walkableUnlessTypes(["wall"]);
 * const away = bfsFarthestStep(matrix, isWalkable, hider.coord, nearestThreat);
 * ```
 */
function bfsFarthestStep(
  matrix: Cell[][],
  isWalkable: IsWalkable,
  from: Coord,
  avoid: Coord,
): Direction | null {
  const queue: Coord[] = [from];
  const distance = new Map<string, number>();
  distance.set(coordKey(from), 0);
  let best = from;
  let bestDist = chebyshev(from, avoid);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    const [x, y] = current;
    const currentDist = distance.get(coordKey(current)) ?? 0;

    for (const [, [dx, dy]] of DIRECTIONS) {
      const nx = x + dx;
      const ny = y + dy;
      const key = coordKey([nx, ny]);
      if (!isWalkable(matrix, nx, ny)) continue;
      if (distance.has(key)) continue;
      distance.set(key, currentDist + 1);
      queue.push([nx, ny]);
      const distFromAvoid = chebyshev([nx, ny], avoid);
      if (distFromAvoid > bestDist) {
        bestDist = distFromAvoid;
        best = [nx, ny];
      }
    }
  }

  return bfsNextStep(matrix, isWalkable, from, best);
}

/**
 * Every cell the walk predicate accepts, row by row.
 *
 * @param matrix - Board to scan.
 * @param isWalkable - Which cells count as open.
 * @returns Coordinates that can be entered.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * import { listOpenCells, walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const open = listOpenCells(matrix, walkableUnlessTypes(["wall", "water"]));
 * ```
 */
function listOpenCells(matrix: Cell[][], isWalkable: IsWalkable): Coord[] {
  const cells: Coord[] = [];
  for (let y = 0; y < matrix.length; y++) {
    const row = matrix[y];
    if (!row) continue;
    for (let x = 0; x < row.length; x++) {
      if (isWalkable(matrix, x, y)) cells.push([x, y]);
    }
  }
  return cells;
}

/**
 * Interior open cells in a snake, left to right on odd rows and right to left
 * on even rows. The border ring is left out so a sweep does not hug the wall.
 *
 * @param matrix - Board to scan.
 * @param isWalkable - Which cells count as open.
 * @returns Sweep order. Empty when the board is smaller than 3 by 3.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * import { buildCoveragePath, walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const sweep = buildCoveragePath(matrix, walkableUnlessTypes(["wall"]));
 * ```
 */
function buildCoveragePath(matrix: Cell[][], isWalkable: IsWalkable): Coord[] {
  const cells: Coord[] = [];
  for (let y = 1; y < matrix.length - 1; y++) {
    const width = matrix[y]?.length ?? 0;
    const row: Coord[] = [];
    for (let x = 1; x < width - 1; x++) {
      if (isWalkable(matrix, x, y)) row.push([x, y]);
    }
    if (y % 2 === 0) row.reverse();
    cells.push(...row);
  }
  return cells;
}

export { bfsFarthestStep, bfsNextStep, buildCoveragePath, listOpenCells };
