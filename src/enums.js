export const gridEventsEnum = {
  STATE_UPDATED: "gamegridhtml:state:updated",

  MOVE_LEFT: "gamegridhtml:move:left",
  MOVE_RIGHT: "gamegridhtml:move:right",
  MOVE_UP: "gamegridhtml:move:up",
  MOVE_DOWN: "gamegridhtml:move:down",

  MOVE_BLOCKED: "gamegridhmtl:move:blocked", // hits a wall
  MOVE_COLLISION: "gamegridhtml:move:collide", // overlaps another entity
  MOVE_DETTACH: "gamegridhtml:move:dettach", // leaves overlapping an entity
  MOVE_LAND: "gamegridhtml:move:land",
};

/**
 * Taxonomy:
 * You get BLOCKED by Barriers
 * You COLLIDE with Interactive cells
 * You DETTACH from Interactive cells
 * You LAND on an open cell
 * 
 */

export const tileTypeEnum = {
  OPEN: "open",
  BARRIER: "barrier",
  INTERACTIVE: "interactive",
};
