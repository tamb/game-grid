import { chebyshev, coordKey, DIRECTIONS, deltaOf, nearestCoord, pickRandom } from './geom';
import { bfsNextStep, buildCoveragePath } from './pathfinding';
import type { Cell, Coord, Difficulty, Direction, IsWalkable, NpcMemory } from './types';
import { openDirections } from './walk';

const LAST_SEEN_TTL: Record<Difficulty, number> = {
  dumb: 4,
  normal: 8,
  smart: 12,
};

const INVESTIGATE_RADIUS: Record<Difficulty, number> = {
  dumb: 0,
  normal: 2,
  smart: 3,
};

/**
 * Inputs for {@link chooseSeekerStep}. The same `memory` object is passed again
 * on the next tick.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * import { createNpcMemory, type SeekerStepArgs } from "@tamb/gamegrid/npc";
 *
 * const args: SeekerStepArgs = {
 *   matrix,
 *   isWalkable,
 *   self: [1, 1],
 *   visibleQuarry: [{ id: "hider", coord: [4, 1] }],
 *   isQuarryActive: () => true,
 *   memory: createNpcMemory(),
 *   difficulty: "smart",
 * };
 * ```
 */
interface SeekerStepArgs {
  matrix: Cell[][];
  isWalkable: IsWalkable;
  self: Coord;
  /** Quarry the caller already decided this seeker can see, closest-search order. */
  visibleQuarry: { id: string; coord: Coord }[];
  /**
   * False forgets a stored sighting. `id` is null when the sighting has a cell
   * but the caller never had an id for it.
   */
  isQuarryActive: (id: string | null, coord: Coord) => boolean;
  /** Cells to investigate before the last sighting. Omit when the game has none. */
  lures?: Coord[];
  memory: NpcMemory;
  difficulty: Difficulty;
  /** Directions the caller will accept. Omit for every open neighbor. */
  legal?: Direction[];
  rng?: () => number;
  /**
   * Milliseconds to wait before the next move when this seeker is standing on
   * a visible quarry. Omit or pass `0` to move on immediately.
   */
  pauseOnOverlapMs?: number;
  /**
   * Clock reading, in milliseconds, for {@link SeekerStepArgs.pauseOnOverlapMs}.
   * Defaults to `Date.now()`.
   */
  now?: number;
}

function ensureCoverageCells(
  matrix: Cell[][],
  isWalkable: IsWalkable,
  memory: NpcMemory,
  coarse: boolean,
): Coord[] {
  if (memory.coverageCells.length === 0) {
    const full = buildCoveragePath(matrix, isWalkable);
    memory.coverageCells = coarse ? full.filter(([, y]) => y % 2 === 0) : full;
  }
  return memory.coverageCells;
}

function nextCoverageTarget(
  matrix: Cell[][],
  isWalkable: IsWalkable,
  memory: NpcMemory,
  coarse: boolean,
): Coord | null {
  const cells = ensureCoverageCells(matrix, isWalkable, memory, coarse);
  if (cells.length === 0) return null;
  const start = memory.coverageIndex % cells.length;
  for (let i = 0; i < cells.length; i++) {
    const idx = (start + i) % cells.length;
    const target = cells[idx];
    if (!target) continue;
    if (!memory.visited.has(coordKey(target))) {
      memory.coverageIndex = idx;
      return target;
    }
  }
  memory.coverageIndex = (memory.coverageIndex + 1) % cells.length;
  return cells[memory.coverageIndex] ?? null;
}

function pickUnvisitedDirection(
  self: Coord,
  memory: NpcMemory,
  legal: Direction[],
): Direction | null {
  const [x, y] = self;
  const unvisited = legal.filter((dir) => {
    const [dx, dy] = deltaOf(dir);
    return !memory.visited.has(coordKey([x + dx, y + dy]));
  });
  // The injected rng is only for the final fallback. Unvisited picks stay on
  // Math.random so a seeded fallback does not reshuffle the search.
  return pickRandom(unvisited.length > 0 ? unvisited : legal);
}

function syncLure(self: Coord, memory: NpcMemory, lures: readonly Coord[]): void {
  if (memory.lure && memory.lure[0] === self[0] && memory.lure[1] === self[1]) {
    memory.lure = null;
  }

  const nearest = nearestCoord(self, lures);
  // Copy. Callers keep mutable [x, y] tuples on actors and reuse them after
  // the lure list drops; storing the same array retargets this seeker.
  if (nearest) memory.lure = [nearest[0], nearest[1]];
}

function stepToward(
  matrix: Cell[][],
  isWalkable: IsWalkable,
  self: Coord,
  target: Coord,
  legal: Direction[],
): Direction | null {
  const bfs = bfsNextStep(matrix, isWalkable, self, target);
  if (bfs && legal.includes(bfs)) return bfs;
  return null;
}

function headingBetween(from: Coord, to: Coord): Direction | null {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  if (dx === 0 && dy === 0) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

function clearLastSeen(memory: NpcMemory): void {
  memory.lastSeen = null;
  memory.lastSeenId = null;
  memory.heading = null;
  memory.ttl = 0;
  memory.investigating = false;
}

function rememberSighting(
  memory: NpcMemory,
  quarry: { id: string; coord: Coord },
  ttl: number,
): void {
  const next: Coord = [quarry.coord[0], quarry.coord[1]];
  if (memory.lastSeen && memory.lastSeenId === quarry.id) {
    const heading = headingBetween(memory.lastSeen, next);
    if (heading) memory.heading = heading;
  } else if (memory.lastSeenId !== quarry.id) {
    memory.heading = null;
  }
  memory.lastSeen = next;
  memory.lastSeenId = quarry.id;
  memory.investigating = false;
  memory.ttl = ttl;
}

function closestQuarry(
  self: Coord,
  quarry: readonly { id: string; coord: Coord }[],
): { id: string; coord: Coord } | null {
  const first = quarry[0];
  if (!first) return null;
  return quarry.reduce((best, candidate) => {
    return chebyshev(self, candidate.coord) < chebyshev(self, best.coord) ? candidate : best;
  }, first);
}

function nearestUnvisitedInRing(
  matrix: Cell[][],
  isWalkable: IsWalkable,
  from: Coord,
  center: Coord,
  radius: number,
  visited: Set<string>,
): Coord | null {
  const startKey = coordKey(from);
  const queue: Coord[] = [from];
  const seen = new Set<string>([startKey]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    const key = coordKey(current);
    if (key !== startKey && !visited.has(key)) return current;

    for (const [, [dx, dy]] of DIRECTIONS) {
      const next: Coord = [current[0] + dx, current[1] + dy];
      const nextKey = coordKey(next);
      if (seen.has(nextKey)) continue;
      if (!isWalkable(matrix, next[0], next[1])) continue;
      if (chebyshev(next, center) > radius) continue;
      seen.add(nextKey);
      queue.push(next);
    }
  }

  return null;
}

function chooseLastSeenMove(args: SeekerStepArgs, legal: Direction[]): Direction | null {
  const target = args.memory.lastSeen;
  if (!target) return null;

  const arrived = args.self[0] === target[0] && args.self[1] === target[1];
  if (arrived) args.memory.investigating = true;

  if (arrived || args.memory.investigating) {
    if (args.difficulty === 'smart' && args.memory.heading) {
      const heading = args.memory.heading;
      args.memory.heading = null;
      if (legal.includes(heading)) return heading;
    }

    const radius = INVESTIGATE_RADIUS[args.difficulty];
    if (radius <= 0) {
      clearLastSeen(args.memory);
      return null;
    }

    const next = nearestUnvisitedInRing(
      args.matrix,
      args.isWalkable,
      args.self,
      target,
      radius,
      args.memory.visited,
    );
    if (!next) {
      clearLastSeen(args.memory);
      return null;
    }
    return stepToward(args.matrix, args.isWalkable, args.self, next, legal);
  }

  return stepToward(args.matrix, args.isWalkable, args.self, target, legal);
}

/**
 * Decide a seeker's next step.
 * Order is fixed: closest visible quarry, nearest lure, last-seen cell and its
 * ring, a coverage sweep, an unvisited neighbor, then a random legal step.
 * Standing on a visible quarry does not hold the cell unless
 * {@link SeekerStepArgs.pauseOnOverlapMs} is set.
 * Memory is mutated. Pass the same object next tick.
 *
 * @param args - Board, position, quarry, and memory.
 * @param args.matrix - Board the seeker is standing on.
 * @param args.isWalkable - Which cells may be entered.
 * @param args.self - Seeker coordinate.
 * @param args.visibleQuarry - Quarry the caller says this seeker can see right now.
 * @param args.isQuarryActive - False drops a stored sighting. The brain does not know why.
 * @param args.lures - Cells to walk to before checking the last sighting. Omit for none.
 * @param args.memory - Search state from {@link createNpcMemory}. Mutated.
 * @param args.difficulty - Dumb, normal, or smart. Changes how long a sighting lasts.
 * @param args.legal - Directions the caller will accept. Omit for every open neighbor.
 * @param args.rng - Random source for the last-resort step. Defaults to `Math.random`.
 * @param args.pauseOnOverlapMs - Wait this long, in milliseconds, before moving off a visible quarry in the same cell. Omit to move immediately.
 * @param args.now - Clock reading for that wait. Defaults to `Date.now()`.
 * @returns One direction, or null when no legal step exists or an overlap pause is still running.
 *
 * @category NPC
 *
 * @example Chase quarry the caller says is visible
 * ```ts
 * import { chooseSeekerStep, createNpcMemory, walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const memory = createNpcMemory();
 * const isWalkable = walkableUnlessTypes(["wall", "water"]);
 * const dir = chooseSeekerStep({
 *   matrix,
 *   isWalkable,
 *   self: seeker.coord,
 *   visibleQuarry: hidersInSight.map((hider) => ({ id: hider.id, coord: hider.coord })),
 *   isQuarryActive: (id) => hiders.some((hider) => hider.id === id && hider.alive),
 *   memory,
 *   difficulty: "smart",
 * });
 *
 * if (dir) stepActor(seeker, dir);
 * ```
 *
 * @example Lures, with nobody visible
 * ```ts
 * import { chooseSeekerStep } from "@tamb/gamegrid/npc";
 *
 * chooseSeekerStep({
 *   matrix,
 *   isWalkable,
 *   self: seeker.coord,
 *   visibleQuarry: [],
 *   isQuarryActive: () => false,
 *   lures: alarms.map((alarm) => alarm.coord),
 *   memory,
 *   difficulty: "normal",
 * });
 * ```
 */
function sameCell(a: Coord, b: Coord): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

/**
 * True while a positive overlap pause has not elapsed.
 * Clears the timer when the seeker is not on a quarry or the pause is off.
 */
function overlapPauseActive(args: SeekerStepArgs, onQuarry: boolean): boolean {
  const pauseMs = args.pauseOnOverlapMs;
  if (!onQuarry || pauseMs == null || !(pauseMs > 0)) {
    args.memory.overlapSince = null;
    return false;
  }

  const now = args.now ?? Date.now();
  if (args.memory.overlapSince == null) {
    args.memory.overlapSince = now;
  }
  return now - args.memory.overlapSince < pauseMs;
}

function chooseSeekerStep(args: SeekerStepArgs): Direction | null {
  const legal = args.legal ?? openDirections(args.matrix, args.isWalkable, args.self);
  if (legal.length === 0) return null;

  const rng = args.rng ?? Math.random;
  args.memory.visited.add(coordKey(args.self));
  syncLure(args.self, args.memory, args.lures ?? []);

  const closest = closestQuarry(args.self, args.visibleQuarry);
  const onQuarry = closest != null && sameCell(args.self, closest.coord);
  if (closest) {
    rememberSighting(args.memory, closest, LAST_SEEN_TTL[args.difficulty]);
  }
  if (overlapPauseActive(args, onQuarry)) return null;
  if (closest) {
    const chase = stepToward(args.matrix, args.isWalkable, args.self, closest.coord, legal);
    if (chase) return chase;
  }

  const lure = args.memory.lure;
  if (lure && (args.self[0] !== lure[0] || args.self[1] !== lure[1])) {
    const towardLure = stepToward(args.matrix, args.isWalkable, args.self, lure, legal);
    if (towardLure) return towardLure;
  }

  if (args.memory.lastSeen) {
    const stillThere = args.isQuarryActive(args.memory.lastSeenId, args.memory.lastSeen);
    if (!stillThere || args.memory.ttl <= 0) {
      clearLastSeen(args.memory);
    } else {
      args.memory.ttl -= 1;
      const resume = chooseLastSeenMove(args, legal);
      if (resume) return resume;
    }
  }

  if (args.difficulty === 'smart' || args.difficulty === 'normal') {
    const coverageTarget = nextCoverageTarget(
      args.matrix,
      args.isWalkable,
      args.memory,
      args.difficulty === 'normal',
    );
    if (coverageTarget) {
      const step = bfsNextStep(args.matrix, args.isWalkable, args.self, coverageTarget);
      if (step && legal.includes(step)) return step;
      // A walled-off cell is still unvisited, so the sweep would pin itself
      // there and never walk the reachable rooms. Skip one such cell per tick.
      // A real step that this caller currently rejects stays put and is retried.
      if (!step && coordKey(coverageTarget) !== coordKey(args.self)) {
        const count = args.memory.coverageCells.length;
        args.memory.coverageIndex = (args.memory.coverageIndex + 1) % count;
      }
    }
  }

  const unvisited = pickUnvisitedDirection(args.self, args.memory, legal);
  if (unvisited) return unvisited;

  return pickRandom(legal, rng);
}

export { chooseSeekerStep, type SeekerStepArgs };
