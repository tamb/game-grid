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
| [Data model](modules.html#data-model) | [`ICell`](interfaces/ICell.html), [`ICellContext`](interfaces/ICellContext.html) |
| [Events](modules.html#events) | [`gridEventsEnum`](variables/gridEventsEnum.html), [`gameGridEventsEnum`](variables/gameGridEventsEnum.html), [`IGameGridEventDetail`](interfaces/IGameGridEventDetail.html), [`GameGridDOMEvent`](types/GameGridDOMEvent.html) |
| [Zoom](modules.html#zoom) | [`IZoomBounds`](interfaces/IZoomBounds.html), [`IZoomOptions`](interfaces/IZoomOptions.html), [`IRegionTile`](interfaces/IRegionTile.html), [`ZoomQuadrant`](types/ZoomQuadrant.html) |
| [References](modules.html#references) | [`IRefsObject`](interfaces/IRefsObject.html), [`IRow`](interfaces/IRow.html) |
| [Cells](modules.html#cells) | [`cellTypeEnum`](variables/cellTypeEnum.html) |
| [Movement](modules.html#movement) | [`directionEnum`](enums/directionEnum.html) |
| [Inputs](modules.html#inputs) | [`keycodeEnum`](enums/keycodeEnum.html) |
| [Presentation](modules.html#presentation) | [`classesEnum`](enums/classesEnum.html), [`directionClassEnum`](variables/directionClassEnum.html) |

## Coordinates

Movement and state use **`[x, y]`**: column (x), then row (y). The backing matrix is `matrix[row][col]` → `matrix[y][x]`.

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
