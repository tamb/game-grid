export const gridEventsEnum = {
  RENDERED: "gamegrid:grid:rendered",
  STATE_UPDATED: "gamegrid:state:updated",

  MOVE_LEFT: "gamegrid:move:left",
  MOVE_RIGHT: "gamegrid:move:right",
  MOVE_UP: "gamegrid:move:up",
  MOVE_DOWN: "gamegrid:move:down",

  MOVE_BLOCKED: "gamegrid:move:blocked", // hits a wall
  MOVE_COLLISION: "gamegrid:move:collide", // overlaps another entity
  MOVE_DETTACH: "gamegrid:move:dettach", // leaves overlapping an entity
  MOVE_LAND: "gamegrid:move:land", // move finished

  LIMIT: "gamegrid:move:limit",
  LIMIT_X: "gamegrid:move:limit:x",
  LIMIT_Y: "gamegrid:move:limit:y",

  WRAP: "gamegrid:move:wrap",
  WRAP_X: "gamegrid:move:wrap:x",
  WRAP_Y: "gamegrid:move:wrap:y",
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
