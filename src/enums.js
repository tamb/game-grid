export const gridEventsEnum = {
  RENDERED: "gamegridhtml:grid:rendered",
  STATE_UPDATED: "gamegridhtml:state:updated",

  MOVE_LEFT: "gamegridhtml:move:left",
  MOVE_RIGHT: "gamegridhtml:move:right",
  MOVE_UP: "gamegridhtml:move:up",
  MOVE_DOWN: "gamegridhtml:move:down",

  MOVE_BLOCKED: "gamegridhmtl:move:blocked", // hits a wall
  MOVE_COLLISION: "gamegridhtml:move:collide", // overlaps another entity
  MOVE_DETTACH: "gamegridhtml:move:dettach", // leaves overlapping an entity
  MOVE_LAND: "gamegridhtml:move:land", // move finished

  LIMIT: "gamegridhtml:limit",
  LIMIT_X: "gamegridhtml:limit:x",
  LIMIT_Y: "gamegridhtml:limit:y",

  WRAP: "gamegridhtml:wrap",
  WRAP_X: "gamegridhtml:wrap:x",
  WRAP_Y: "gamegridhtml:wrap:y",
};

/**
 * Taxonomy:
 * You get BLOCKED by Barriers
 * You COLLIDE with Interactive cells
 * You DETTACH from Interactive cells
 * You LAND on an open cell
 *
 */

export const cellTypeEnum = {
  OPEN: "open",
  BARRIER: "barrier",
  INTERACTIVE: "interactive",
};
