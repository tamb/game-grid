export const gridEventsEnum = {
    MOVE_LEFT: "gamegrid:move:left",
    MOVED_LEFT: "gamegrid:moved:left",
    MOVE_RIGHT: "gamegrid:move:right",
    MOVED_RIGHT: "gamegrid:moved:right",
    MOVE_UP: "gamegrid:move:up",
    MOVED_UP: "gamegrid:moved:up",
    MOVE_DOWN: "gamegrid:move:down",
    MOVED_DOWN: "gamegrid:moved:down",
  
    TILE_HOVER: "gamegrid:tile:hover",
    TILE_FOCUS: "gamegrid:tile:focus",
    TILE_BLUR: "gamegrid:tile:blur",
  
    STAGE_RENDER: "gamegrid:stage:render",
  
    ROW_LIMIT: "gamegrid:row:limit", // hits stage limit via row
    ROW_WRAP: "gamegrid:row:wrap", // wraps to other side of stage via row
    ROW_RENDER: "gamegrid:row:render",
  
    COL_LIMIT: "gamegrid:col:limit", // hits stage limit via col
    COL_WRAP: "gamegrid:col:wrap", // wraps to other side of stage via col
  
    // TODO
    POINT_BLOCK: "gamegrid:point:block", // hits a wall
    POINT_COLLIDE: "gamegrid:point:collide", // overlaps another entity
    POINT_DETTACH: "gamegrid:point:dettach" // leaves overlapping an entity
  };
  
  export const tileTypeEnum = {
    OPEN: "open",
    BARRIER: "barrier",
    INTERACTIVE: "interactive"
  };
  