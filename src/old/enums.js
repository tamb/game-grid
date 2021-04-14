export const gridEventsEnum = {
  STATE_UPDATED: "gamegrid:state:updated",

  MOVE_LEFT: "gamegrid:move:left",
  MOVED_LEFT: "gamegrid:moved:left",
  MOVE_RIGHT: "gamegrid:move:right",
  MOVED_RIGHT: "gamegrid:moved:right",
  MOVE_UP: "gamegrid:move:up",
  MOVED_UP: "gamegrid:moved:up",
  MOVE_DOWN: "gamegrid:move:down",
  MOVED_DOWN: "gamegrid:moved:down",

  // TODO
  MOVE_BLOCKED: "gamegrid:move:block", // hits a wall
  MOVE_COLLISION: "gamegrid:move:collide", // overlaps another entity
  MOVE_DETTACH: "gamegrid:move:dettach", // leaves overlapping an entity
};

export const tileTypeEnum = {
  OPEN: "open",
  BARRIER: "barrier",
  INTERACTIVE: "interactive",
};
