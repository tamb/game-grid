import { chebyshev, deltaOf, nearestCoord, OPPOSITE, pickRandom } from './geom';
import { bfsFarthestStep } from './pathfinding';
import type { Cell, Coord, Difficulty, Direction, IsWalkable } from './types';
import { openDirections } from './walk';

const NORMAL_THREAT_RADIUS = 4;
const SMART_THREAT_RADIUS = 6;

/**
 * Inputs for {@link chooseHiderAction}. Leave `taunt` off unless the caller
 * has something to do with the `"taunt"` result.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * import type { HiderActionArgs } from "@tamb/gamegrid/npc";
 *
 * const args: HiderActionArgs = {
 *   matrix,
 *   isWalkable,
 *   self: [2, 2],
 *   threats: [[5, 2]],
 *   difficulty: "normal",
 * };
 * ```
 *
 * @example Taunt allowed, and only some directions
 * ```ts
 * import type { HiderActionArgs } from "@tamb/gamegrid/npc";
 *
 * const args: HiderActionArgs = {
 *   matrix,
 *   isWalkable,
 *   self: [2, 1],
 *   threats: [[4, 1]],
 *   difficulty: "smart",
 *   legal: ["left", "right"],
 *   canTauntNow: true,
 *   taunt: true,
 *   rng: () => 0,
 * };
 * ```
 */
interface HiderActionArgs {
  matrix: Cell[][];
  isWalkable: IsWalkable;
  self: Coord;
  threats: Coord[];
  difficulty: Difficulty;
  /**
   * Steps the caller will accept. Omit to use every open neighbor.
   * An empty list means the caller will not move, which is how a move limit
   * is applied without this module knowing the rule.
   */
  legal?: Direction[];
  rng?: () => number;
  /** Caller already applied its cooldown. Omitted means not ready. */
  canTauntNow?: boolean;
  /**
   * When omitted or false, the result is never `"taunt"`.
   * Pass true to allow the taunt rolls.
   */
  taunt?: boolean;
}

function directionToward(
  matrix: Cell[][],
  isWalkable: IsWalkable,
  from: Coord,
  to: Coord,
): Direction | null {
  const [fx, fy] = from;
  const dx = Math.sign(to[0] - fx);
  const dy = Math.sign(to[1] - fy);
  const candidates: Direction[] = [];
  if (dx !== 0) candidates.push(dx > 0 ? 'right' : 'left');
  if (dy !== 0) candidates.push(dy > 0 ? 'down' : 'up');

  for (const dir of candidates) {
    const [dx, dy] = deltaOf(dir);
    if (isWalkable(matrix, fx + dx, fy + dy)) return dir;
  }
  return null;
}

function avoidsThreat(self: Coord, dir: Direction, threat: Coord): boolean {
  const [dx, dy] = deltaOf(dir);
  return self[0] + dx !== threat[0] || self[1] + dy !== threat[1];
}

function chooseFlee(
  args: HiderActionArgs,
  legal: Direction[],
  rng: () => number,
): Direction | null {
  const { difficulty } = args;
  if (difficulty === 'dumb') {
    if (rng() < 0.35) return pickRandom(legal, rng);
    return null;
  }

  const threat = nearestCoord(args.self, args.threats);
  if (!threat) return null;

  const threatRadius = difficulty === 'smart' ? SMART_THREAT_RADIUS : NORMAL_THREAT_RADIUS;
  if (chebyshev(args.self, threat) > threatRadius) return null;

  const safeLegal = legal.filter((dir) => avoidsThreat(args.self, dir, threat));
  if (safeLegal.length === 0) return null;

  if (difficulty === 'normal') {
    const toward = directionToward(args.matrix, args.isWalkable, args.self, threat);
    if (toward && safeLegal.includes(OPPOSITE[toward])) return OPPOSITE[toward];
    return pickRandom(safeLegal, rng);
  }

  const flee = bfsFarthestStep(args.matrix, args.isWalkable, args.self, threat);
  if (flee && safeLegal.includes(flee)) return flee;
  return pickRandom(safeLegal, rng);
}

function wantsTaunt(args: HiderActionArgs, rng: () => number): boolean {
  if (args.taunt !== true || !args.canTauntNow) return false;

  const threat = nearestCoord(args.self, args.threats);
  if (!threat) return false;

  const distance = chebyshev(args.self, threat);
  const { difficulty } = args;

  // Rolls are per call. The caller ticks often and already gates cooldown
  // through canTauntNow, so these stay small.
  if (difficulty === 'dumb') {
    if (distance > NORMAL_THREAT_RADIUS) return false;
    return rng() < 0.02;
  }

  if (difficulty === 'normal') {
    if (distance > NORMAL_THREAT_RADIUS) return false;
    return rng() < 0.08;
  }

  if (distance > SMART_THREAT_RADIUS || distance < 2) return false;
  return rng() < 0.2;
}

/**
 * Decide a hider's next action: taunt, step away from the nearest threat, or wait.
 * `taunt` defaults to false, so a caller that never passes it cannot receive `"taunt"`.
 * What a taunt does after this returns is the caller's game.
 *
 * @param args - Board, position, threats, and difficulty.
 * @param args.matrix - Board the hider is standing on.
 * @param args.isWalkable - Which cells may be entered.
 * @param args.self - Hider coordinate.
 * @param args.threats - Coordinates to flee. The nearest one is the threat.
 * @param args.difficulty - Dumb wanders, normal steps directly away, smart paths away.
 * @param args.legal - Directions the caller will accept. Omit for every open neighbor.
 * @param args.rng - Random source. Defaults to `Math.random`.
 * @param args.canTauntNow - False or omitted skips the taunt roll even when `taunt` is true.
 * @param args.taunt - Pass true to allow a taunt. Defaults to false.
 * @returns `"taunt"`, a direction, or null when the hider waits.
 *
 * @category NPC
 *
 * @example A hider that never taunts
 * ```ts
 * import { chooseHiderAction, walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const isWalkable = walkableUnlessTypes(["wall", "water"]);
 * const step = chooseHiderAction({
 *   matrix,
 *   isWalkable,
 *   self: hider.coord,
 *   threats: guards.map((guard) => guard.coord),
 *   difficulty: "normal",
 * });
 *
 * if (step && step !== "taunt") stepActor(hider, step);
 * ```
 *
 * @example Pass true when a taunt should be possible
 * ```ts
 * import { chooseHiderAction, walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const action = chooseHiderAction({
 *   matrix,
 *   isWalkable: walkableUnlessTypes(["barrier"]),
 *   self: hider.coord,
 *   threats: seekerCoords,
 *   difficulty: "smart",
 *   canTauntNow: cooldownReady,
 *   taunt: true,
 * });
 * ```
 *
 * @example A seeded roll that taunts
 * ```ts
 * import { chooseHiderAction, walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const matrix = [
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
 *   [{ type: "wall" }, { type: "floor" }, { type: "floor" }, { type: "floor" }, { type: "floor" }],
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
 * ];
 *
 * const action = chooseHiderAction({
 *   matrix,
 *   isWalkable: walkableUnlessTypes(["wall"]),
 *   self: [1, 1],
 *   threats: [[4, 1]],
 *   difficulty: "smart",
 *   canTauntNow: true,
 *   taunt: true,
 *   rng: () => 0,
 * });
 * // "taunt". Distance 3 is inside the smart radius, and the roll hits.
 * ```
 *
 * @example A missed taunt roll still flees
 * ```ts
 * import { chooseHiderAction, walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const matrix = [
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
 *   [{ type: "wall" }, { type: "floor" }, { type: "floor" }, { type: "floor" }, { type: "floor" }],
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
 * ];
 *
 * const action = chooseHiderAction({
 *   matrix,
 *   isWalkable: walkableUnlessTypes(["wall"]),
 *   self: [2, 1],
 *   threats: [[4, 1]],
 *   difficulty: "smart",
 *   canTauntNow: true,
 *   taunt: true,
 *   rng: () => 0.5,
 * });
 * // "left". The roll missed, so the hider steps away from [4, 1].
 * ```
 *
 * @example Normal steps directly away
 * ```ts
 * import { chooseHiderAction, walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const matrix = [
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
 *   [{ type: "wall" }, { type: "floor" }, { type: "floor" }, { type: "floor" }, { type: "floor" }],
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
 * ];
 *
 * const action = chooseHiderAction({
 *   matrix,
 *   isWalkable: walkableUnlessTypes(["wall"]),
 *   self: [2, 1],
 *   threats: [[1, 1]],
 *   difficulty: "normal",
 * });
 * // "right"
 * ```
 *
 * @example Dumb waits when the wander roll misses
 * ```ts
 * import { chooseHiderAction, walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const matrix = [
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
 *   [{ type: "wall" }, { type: "floor" }, { type: "floor" }, { type: "floor" }, { type: "floor" }],
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
 * ];
 *
 * const action = chooseHiderAction({
 *   matrix,
 *   isWalkable: walkableUnlessTypes(["wall"]),
 *   self: [2, 1],
 *   threats: [[1, 1]],
 *   difficulty: "dumb",
 *   rng: () => 0.9,
 * });
 * // null
 * ```
 *
 * @example An empty legal list means the caller will not move
 * ```ts
 * import { chooseHiderAction, walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const matrix = [
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
 *   [{ type: "wall" }, { type: "floor" }, { type: "floor" }, { type: "floor" }, { type: "floor" }],
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
 * ];
 *
 * const action = chooseHiderAction({
 *   matrix,
 *   isWalkable: walkableUnlessTypes(["wall"]),
 *   self: [2, 1],
 *   threats: [[1, 1]],
 *   difficulty: "normal",
 *   legal: [],
 * });
 * // null
 * ```
 */
function chooseHiderAction(args: HiderActionArgs): 'taunt' | Direction | null {
  const rng = args.rng ?? Math.random;
  if (wantsTaunt(args, rng)) return 'taunt';

  const legal = args.legal ?? openDirections(args.matrix, args.isWalkable, args.self);
  if (legal.length === 0) return null;
  return chooseFlee(args, legal, rng);
}

export { chooseHiderAction, type HiderActionArgs };
