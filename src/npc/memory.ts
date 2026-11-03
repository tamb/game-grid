import type { NpcMemory } from './types';

/**
 * Empty search state for one NPC. Keep this object and pass it on later ticks.
 * Replacing it forgets visited cells, the last sighting, and the coverage sweep.
 *
 * @returns A new memory object the brains mutate.
 *
 * @category NPC
 *
 * @example
 * ```ts
 * import { chooseSeekerStep, createNpcMemory, walkableUnlessTypes } from "@tamb/gamegrid/npc";
 *
 * const memory = createNpcMemory();
 * const matrix = [[{ type: "floor" }, { type: "floor" }]];
 * const isWalkable = walkableUnlessTypes(["wall"]);
 *
 * chooseSeekerStep({
 *   matrix,
 *   isWalkable,
 *   self: [0, 0],
 *   visibleQuarry: [],
 *   isQuarryActive: () => false,
 *   memory,
 *   difficulty: "normal",
 * });
 *
 * chooseSeekerStep({
 *   matrix,
 *   isWalkable,
 *   self: [1, 0],
 *   visibleQuarry: [],
 *   isQuarryActive: () => false,
 *   memory,
 *   difficulty: "normal",
 * });
 * ```
 */
function createNpcMemory(): NpcMemory {
  return {
    visited: new Set(),
    lastSeen: null,
    lastSeenId: null,
    heading: null,
    ttl: 0,
    investigating: false,
    lure: null,
    coverageIndex: 0,
    coverageCells: [],
    overlapSince: null,
  };
}

export { createNpcMemory };
