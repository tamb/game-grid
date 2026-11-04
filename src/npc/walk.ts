import { DIRECTIONS } from './geom';
import type { Cell, Coord, Direction, IsWalkable } from './types';

/**
 * Walkability that blocks the given cell types and anything off the matrix.
 * A game whose walls are `"barrier"` passes that name. A game whose walls are
 * `"wall"` passes that instead. Types not in the list can be entered.
 *
 * @param blocked - Cell `type` strings that cannot be entered.
 * @returns A predicate for {@link chooseHiderAction}, {@link chooseSeekerStep}, and the search helpers.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * import { walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const matrix = [
 *   [
 *     { type: "floor" },
 *     { type: "wall" },
 *   ],
 *   [
 *     { type: "water" },
 *     { type: "floor" },
 *   ],
 * ];
 * const isWalkable = walkableUnlessTypes(["wall", "water"]);
 * isWalkable(matrix, 0, 0); // floor
 * isWalkable(matrix, 1, 0); // wall, blocked
 * isWalkable(matrix, 1, 1); // floor
 * isWalkable(matrix, -1, 0); // false, off the board
 * isWalkable(matrix, 0, 2); // false, no such row
 * ```
 *
 * @example Walls named barrier
 * ```ts
 * import { walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const isWalkable = walkableUnlessTypes(["barrier"]);
 * const matrix = [[{ type: "open" }, { type: "barrier" }]];
 * isWalkable(matrix, 0, 0); // true
 * isWalkable(matrix, 1, 0); // false
 * ```
 */
function walkableUnlessTypes(blocked: readonly string[]): IsWalkable {
  const blockedTypes = new Set(blocked);
  return (matrix, x, y) => {
    const cell = matrix[y]?.[x];
    if (!cell) return false;
    return !blockedTypes.has(cell.type);
  };
}

function openDirections(matrix: Cell[][], isWalkable: IsWalkable, from: Coord): Direction[] {
  const [x, y] = from;
  const open: Direction[] = [];
  for (const [dir, [dx, dy]] of DIRECTIONS) {
    if (isWalkable(matrix, x + dx, y + dy)) open.push(dir);
  }
  return open;
}

export { openDirections, walkableUnlessTypes };
