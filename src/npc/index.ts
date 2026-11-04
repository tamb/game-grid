/**
 * Hider and seeker decisions for `@tamb/gamegrid/npc`.
 * The caller owns the board, the actors, and the move. These functions return
 * a direction, or `"taunt"` when the caller passed `taunt: true`.
 * Keep one {@link NpcMemory} per seeker and pass that same object every tick.
 *
 * @packageDocumentation
 * @category NPC
 *
 * @example One tick for a seeker and a hider
 * ```ts
 * import {
 *   chooseHiderAction,
 *   chooseSeekerStep,
 *   createNpcMemory,
 *   walkableUnlessTypes,
 * } from "@tamb/gamegrid/npc";
 *
 * const matrix = [
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
 *   [{ type: "wall" }, { type: "floor" }, { type: "floor" }, { type: "floor" }, { type: "floor" }],
 *   [{ type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }, { type: "wall" }],
 * ];
 * const isWalkable = walkableUnlessTypes(["wall"]);
 * const memory = createNpcMemory();
 *
 * const seekerStep = chooseSeekerStep({
 *   matrix,
 *   isWalkable,
 *   self: [1, 1],
 *   visibleQuarry: [{ id: "hider", coord: [3, 1] }],
 *   isQuarryActive: (id) => id === "hider",
 *   memory,
 *   difficulty: "smart",
 * });
 * // "right". Toward the hider.
 *
 * const hiderAction = chooseHiderAction({
 *   matrix,
 *   isWalkable,
 *   self: [3, 1],
 *   threats: [[1, 1]],
 *   difficulty: "normal",
 * });
 * // "right". Away from the seeker.
 * ```
 */
export type { HiderActionArgs } from './hider';
export { chooseHiderAction } from './hider';
export { createNpcMemory } from './memory';
export { bfsFarthestStep, bfsNextStep, buildCoveragePath, listOpenCells } from './pathfinding';
export type { SeekerStepArgs } from './seeker';
export { chooseSeekerStep } from './seeker';
export type { Cell, Coord, Difficulty, Direction, IsWalkable, NpcMemory } from './types';
export { walkableUnlessTypes } from './walk';
