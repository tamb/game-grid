/**
 * Column, then row. The matrix itself is indexed `matrix[row][column]`.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * const here: Coord = [3, 2];
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
 * const step: Direction = "left";
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
 * const cell: Cell = { type: "floor" };
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
 * const difficulty: Difficulty = "smart";
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
}

export type { Cell, Coord, Difficulty, Direction, IsWalkable, NpcMemory };
