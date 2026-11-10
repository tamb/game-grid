/**
 * Column, then row. The matrix itself is indexed `matrix[row][column]`.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * import type { Coord } from "@tamb/gamegrid/npc";
 *
 * const matrix = [[{ type: "wall" }, { type: "floor" }]];
 * const here: Coord = [1, 0];
 * matrix[here[1]][here[0]].type; // "floor". The matrix index is row, then column.
 * ```
 */
type Coord = [number, number];

/**
 * One step on the grid. Diagonals are not a step.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * import type { Direction } from "@tamb/gamegrid/npc";
 *
 * const steps: Direction[] = ["up", "down", "left", "right"];
 * ```
 */
type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * A board cell. Only `type` is read. Any other fields on the object are ignored.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * import type { Cell } from "@tamb/gamegrid/npc";
 *
 * const matrix: Cell[][] = [[{ type: "wall" }, { type: "floor" }]];
 * ```
 */
interface Cell {
  type: string;
}

/**
 * How cautiously an NPC acts. Callers choose this; the brains do not store it.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * import type { Difficulty } from "@tamb/gamegrid/npc";
 *
 * const difficulties: Difficulty[] = ["dumb", "normal", "smart"];
 * ```
 */
type Difficulty = 'dumb' | 'normal' | 'smart';

/**
 * Whether a cell can be entered. Out-of-range coordinates must return false.
 *
 * @param matrix - Board the coordinate is read from.
 * @param x - Column.
 * @param y - Row.
 * @returns True when a step may land on that cell.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * import { walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const isWalkable = walkableUnlessTypes(["wall", "water"]);
 * ```
 *
 * @example Only floors, written by the caller
 * ```ts
 * import type { IsWalkable } from "@tamb/gamegrid/npc";
 *
 * const isWalkable: IsWalkable = (matrix, x, y) => matrix[y]?.[x]?.type === "floor";
 * ```
 */
type IsWalkable = (matrix: Cell[][], x: number, y: number) => boolean;

/**
 * Search state for one NPC, kept by the caller and passed on every tick.
 * Field names are readable on purpose: saved games in Hide and Seek use a
 * different short-key object, and the adapter copies between the two.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * import { createNpcMemory } from "@tamb/gamegrid/npc";
 *
 * const memory = createNpcMemory();
 * ```
 *
 * @example Fields after one chase step
 * ```ts
 * import { chooseSeekerStep, createNpcMemory, walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const matrix = [
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
 *   [{ type: "wall" }, { type: "floor" }, { type: "floor" }, { type: "floor" }, { type: "floor" }],
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
 * ];
 * const memory = createNpcMemory();
 *
 * chooseSeekerStep({
 *   matrix,
 *   isWalkable: walkableUnlessTypes(["wall"]),
 *   self: [1, 1],
 *   visibleQuarry: [{ id: "hider", coord: [4, 1] }],
 *   isQuarryActive: () => true,
 *   memory,
 *   difficulty: "smart",
 * });
 *
 * memory.visited.has("1,1"); // true
 * memory.lastSeen; // [4, 1]
 * memory.lastSeenId; // "hider"
 * memory.ttl; // 12
 * ```
 */
interface NpcMemory {
  /** Cells already stepped on, as `"x,y"`. */
  visited: Set<string>;
  /** Last cell where a quarry was seen. */
  lastSeen: Coord | null;
  /** Id of that quarry, when the caller had one. */
  lastSeenId: string | null;
  /** Direction the quarry was moving when last seen. */
  heading: Direction | null;
  /** Ticks left before the sighting is forgotten. */
  ttl: number;
  /** True once the NPC has reached the last-seen cell and is searching around it. */
  investigating: boolean;
  /** Cell the NPC is walking toward because the caller passed it as a lure. */
  lure: Coord | null;
  /** Index into {@link NpcMemory.coverageCells}. */
  coverageIndex: number;
  /** Sweep order. Empty until the first coverage decision fills it. */
  coverageCells: Coord[];
  /**
   * Clock time when this seeker started waiting on a quarry in the same cell.
   * Null when it is not waiting. Set only while {@link SeekerStepArgs.pauseOnOverlapMs} is positive.
   */
  overlapSince: number | null;
  /**
   * Quarry this seeker already stepped off of. Chase and last-seen search skip
   * it while it stays on {@link NpcMemory.releasedQuarryCell} and remains the
   * closest visible quarry. Null when the seeker is not leaving one.
   */
  releasedQuarryId: string | null;
  /** Cell copied from the quarry at the moment the seeker stepped off it. */
  releasedQuarryCell: Coord | null;
}

export type { Cell, Coord, Difficulty, Direction, IsWalkable, NpcMemory };
