# GameGrid API reference

**@tamb/gamegrid** — a TypeScript library for 2D grid-based web games and interactive matrices.

**Also see:** [site home](https://tamb.github.io/game-grid/) · [interactive demo](https://tamb.github.io/game-grid/demo/output.html) · [GitHub README](https://github.com/tamb/game-grid#readme)

## Table of contents

Browse the full API on the [**exports index**](modules.html):

| Section | Symbols |
| --- | --- |
| [Grid runtime](modules.html#grid-runtime) | [`GameGrid`](classes/GameGrid.html) (default export) |
| [Grid contract](modules.html#grid-contract) | [`IGameGrid`](interfaces/IGameGrid.html) |
| [Configuration](modules.html#configuration) | [`IConfig`](interfaces/IConfig.html), [`IOptions`](interfaces/IOptions.html), [`MiddlewareFn`](types/MiddlewareFn.html) |
| [State](modules.html#state) | [`IState`](interfaces/IState.html), [`StatePatch`](types/StatePatch.html), [`IDefaultState`](interfaces/IDefaultState.html), [`INITIAL_STATE`](variables/INITIAL_STATE.html) |
| [Data model](modules.html#data-model) | [`ICell`](interfaces/ICell.html), [`ICellContext`](interfaces/ICellContext.html), [`ICellRefresh`](interfaces/ICellRefresh.html) |
| [Events](modules.html#events) | [`gridEventsEnum`](variables/gridEventsEnum.html), [`gameGridEventsEnum`](variables/gameGridEventsEnum.html), [`IGameGridEventDetail`](interfaces/IGameGridEventDetail.html), [`IMoveEventDetail`](interfaces/IMoveEventDetail.html), [`GameGridDOMEvent`](types/GameGridDOMEvent.html) |
| [Zoom](modules.html#zoom) | [`IZoomBounds`](interfaces/IZoomBounds.html), [`IZoomOptions`](interfaces/IZoomOptions.html), [`IRegionTile`](interfaces/IRegionTile.html), [`ZoomQuadrant`](types/ZoomQuadrant.html) |
| [References](modules.html#references) | [`IRefsObject`](interfaces/IRefsObject.html), [`IRow`](interfaces/IRow.html) |
| [Cells](modules.html#cells) | [`cellTypeEnum`](variables/cellTypeEnum.html) |
| [Movement](modules.html#movement) | [`directionEnum`](enums/directionEnum.html) |
| [Inputs](modules.html#inputs) | [`keycodeEnum`](enums/keycodeEnum.html) |
| [Presentation](modules.html#presentation) | [`classesEnum`](enums/classesEnum.html), [`directionClassEnum`](variables/directionClassEnum.html) |

## Instance jobs

[`GameGrid`](classes/GameGrid.html) / [`IGameGrid`](interfaces/IGameGrid.html) methods stay **flat on the instance**. TypeDoc groups them by **job** (not DOM vs data):

| Job | What it does | Members |
| --- | --- | --- |
| [Matrix](classes/GameGrid.html#matrix) | Logical cells. Writes do not paint. | `getMatrix`, `setMatrix`, `getCell`, `setCell`, `getAllCellsByType`, `getActiveCell`, `getPreviousCell` |
| [Movement](classes/GameGrid.html#movement) | Focus and history. Updates state and events; highlights when mounted. | `setActiveCell`, `moveUp` / `moveRight` / `moveDown` / `moveLeft`, `moveTo`, `rewind`, `rewindTo`, `unrewind`, `unrewindTo` |
| [View](classes/GameGrid.html#view) | Optional markup. Omit `render` for headless use. | `refs`, `render`, `refresh`, `refreshCells`, `destroy` |
| [State](classes/GameGrid.html#state) | Authoritative [`IState`](interfaces/IState.html). Middleware, no grid `CustomEvent`s. | `getState`, `setStateSync` |
| [Options](classes/GameGrid.html#options-1) | Runtime toggles. Does not swap the matrix or re-render. | `options`, `getOptions`, `setOptions` |
| [Zoom](classes/GameGrid.html#zoom) | Viewport window and region tiles. | `getZoom`, `setZoom`, `clearZoom`, `getZoomAround`, `getQuadrantZoom`, `getFractionZoom`, `zoomAround`, `zoomQuadrant`, `zoomFraction`, `getRegionAt`, `getActiveRegion` |

`setCell` / `setMatrix` write the matrix only. `refreshCells` / `refresh` / `render` paint. `refreshCells` also writes when you pass `cell`.

## Coordinates

Movement and state use **`[x, y]`**: column (x), then row (y). The backing matrix is `matrix[row][col]` → `matrix[y][x]`.

## Rewind and history

`state.moves` is an oldest-first trail of landed `[x, y]` cells, including the current cell. `rewindLimit` (default `20`) caps its length; the oldest entry drops first. Blocked attempts are not recorded. `rewind` / `rewindTo` push dropped coords onto `state.future`. `unrewind` / `unrewindTo` replay that stack. A new landed cell clears `future`; a blocked stay does not.

```ts
grid.moveDown();
grid.moveRight();
grid.rewind();      // back one step
grid.unrewind();    // redo that step
grid.rewind(2);     // back two steps (clamps to the oldest remaining)
grid.rewindTo(0);   // jump to the oldest remaining index
grid.unrewindTo(2); // jump forward in the combined moves + future trail
```

`rewind` / `rewindTo` emit [`REWIND`](variables/gridEventsEnum.html) (`detail.steps`, `detail.index`, plus [`IMoveEventDetail`](interfaces/IMoveEventDetail.html)) then [`MOVE_LAND`](variables/gridEventsEnum.html). `unrewind` / `unrewindTo` emit [`UNREWIND`](variables/gridEventsEnum.html) the same way. They are not rate-limited by `moveDebounce`.

## moveTo

`moveTo(coords)` walks one cell or an explicit list of cells through [`setActiveCell`](classes/GameGrid.html#setactivecell). Each step uses the existing block / collide / wrap / zoom-edge rules. Gaps teleport (no A*). The walk stops when a step does not land on the requested cell.

```ts
grid.moveTo([2, 1]);
grid.moveTo([
  [0, 1],
  [0, 2],
  [1, 2],
]);
```

## Move event detail

`MOVE_*` events (and wrap / boundary events from the same attempt) include [`IMoveEventDetail`](interfaces/IMoveEventDetail.html): `from`, `to` (candidate after wrap/clamp), `direction`, and `blocked`. On a successful land, `to` matches `activeCoords`. On a block, `to` is the rejected cell and `activeCoords` stay at `from`.

## Updating cells

`setCell` writes `matrix[y][x]` only. Movement, `getCell`, `getActiveCell`, and `getPreviousCell` see the new `type` immediately; the DOM (`current`) does not.

`ICell.eventTypes.onEnter` / `onExit` are custom event names dispatched when the active cell changes (`detail.coords`, `detail.cell`). `onLand` / `MOVE_LAND` also require a real coord change. `onDettach` fires only when leaving a collide-type cell for a non-collide cell. `render()` does not run move choreography.

`refreshCells({ coords, cell? })` (one item or an array) optionally writes, then replaces those mounted nodes and emits [`CELLS_REFRESHED`](variables/gridEventsEnum.html). Omit `cell` after a prior `setCell`. Use [`refresh`](classes/GameGrid.html#refresh) when dimensions or the zoom window change.

See the [README flow](https://github.com/tamb/game-grid#updating-cells) and [`ICellRefresh`](interfaces/ICellRefresh.html).

## Quick start

```ts
import GameGrid, { gridEventsEnum, type GameGridDOMEvent } from "@tamb/gamegrid";

const grid = new GameGrid(
  {
    matrix: myMatrix,
    state: { activeCoords: [0, 0] },
    options: { wasdControls: true },
  },
  document.querySelector("#root")!,
);

grid.moveDown();
window.addEventListener(gridEventsEnum.MOVE_LAND, (e: Event) => {
  const ce = e as GameGridDOMEvent;
  console.log(ce.detail.gameGridInstance.getState());
});
```

Omit the container argument for headless use, then call `render(element)` when you need DOM.
