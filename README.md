# GameGrid

**A 2D HTML Grid for Creating Web Games**

<small>or other things that could use a 2D matrix</small>

## Goals

- 2D grid in memory with coordinates and movement rules
- Hooks: callbacks, middleware, and DOM-optional rendering
- TypeScript types included
- Have fun with it

## Demo (Parcel app)

The **`demo/`** package depends on this library via **`"@tamb/gamegrid": "file:.."`** so `npm install` inside **`demo/`** always picks up the built **`dist/`** next to it (no **`npm pack`** tarball).

From the repository root:

```bash
npm run demo
```

That runs **`clean`**, **`npm run build`**, **`npm install` in `demo/`**, then **`npm start` in `demo/`** (Handlebars build + Parcel).

**Strict `npm link` workflow** (optional): register the library globally, then wire the demo to that link:

```bash
npm run link:lib          # build + npm link (registers @tamb/gamegrid globally)
npm run demo:link          # demo npm install + npm link @tamb/gamegrid
npm start                  # cd demo && npm start
```

After a change to the library, run **`npm run build`** again so **`dist/`** updates; Parcel will pick it up on reload when using **`file:..`** or a **`npm link`** symlink.

## API documentation (TypeDoc)

Generate TypeDoc-only:

```bash
npm run docs
```

HTML lands in **`gh-pages/docs/`** (open **`gh-pages/docs/index.html`** locally).

Combined **demo + docs** bundle for GitHub Pages:

```bash
npm run gh-pages
```

That clears **`gh-pages/docs`** and **`gh-pages/demo`**, **`npm run build`**, reinstalls **`demo/`** deps, runs TypeDoc to **`gh-pages/docs`**, and **`parcel build`** to **`gh-pages/demo/`**. The checked-in **`gh-pages/index.html`** links to **`demo/output.html`** and **`docs/`**.

## GitHub Pages

Use **`gh-pages/`** as the site root **`/`**: keep **`index.html`** and **`.nojekyll`** tracked. Generated **`gh-pages/docs/`** and **`gh-pages/demo/`** are **gitignored** (so they won't show up in `git status`) — editors may hide gitignored folders; this repo sets **`explorer.excludeGitIgnore`** to **`false`** in **`.vscode/settings.json`** so `gh-pages/demo` stays visible locally. Confirm with **`ls gh-pages/demo`** after **`npm run gh-pages`**.

**TSDoc tip:** `{@link …}` tags must appear in normal comment text. Wrapping the whole `{@link …}` in inline code (Markdown backticks) stops TypeDoc from resolving links in the generated HTML.

## Coordinates

Movement and state use **`[x, y]`**: **column (x), then row (y)**. The backing matrix is a normal 2D array: **`matrix[row][col]`** i.e. **`matrix[y][x]`**. Methods like **`getCell([x, y])`**, **`setActiveCell(x, y, …)`**, and **`getState().activeCoords`** all follow that convention.

## The class

Install **`@tamb/gamegrid`**. The **default export** is **`GameGrid`**. Many constants and types are **named exports** (see [Public exports](#public-exports)).

```ts
import type { IGameGrid } from "@tamb/gamegrid";
import GameGrid from "@tamb/gamegrid";

// Optional second argument: container to render into immediately.
const grid: IGameGrid = new GameGrid(config, rootElement);

// Headless (no DOM): omit the container.
const memory: IGameGrid = new GameGrid(config);
```

When you pass a **`container`** in the constructor, **`render(container)`** runs immediately. Otherwise call **`render(element)`** later. Headless mode sets **`refs.cells`** to your matrix reference and **`state.rendered`** to **`false`**.

### `config: IConfig`

```ts
export interface IConfig {
  options?: IOptions;
  matrix: ICell[][];
  state?: IDefaultState | IState;
}
```

### `options: IOptions`

```ts
export type MiddlewareFn = (
  gamegridInstance: IGameGrid,
  patch: StatePatch,
) => void;

export interface IOptions {
  id?: string;
  /** Dispatches custom events here; defaults to `window`. */
  eventTarget?: EventTarget;
  arrowControls?: boolean;
  wasdControls?: boolean;
  infiniteX?: boolean;
  infiniteY?: boolean;
  clickable?: boolean;
  rewindLimit?: number;
  middlewares?: {
    pre?: MiddlewareFn[];
    post?: MiddlewareFn[];
  };
  callbacks?: {
    onMove?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onLand?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onBlock?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onCollide?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onDettach?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onBoundary?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onBoundaryX?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onBoundaryY?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onWrap?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onWrapX?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onWrapY?: (gamegridInstance: IGameGrid, newState: IState) => void;
  };

  /** Cell `type` values you cannot step onto; you stay on the previous cell. */
  blockOnType?: string[];
  /** Cell `type` values that trigger collision when entered (you still move unless also blocked). */
  collideOnType?: string[];
  /**
   * If non-empty, only these `type` values are enterable (in addition to `blockOnType`).
   * If omitted or empty, any non-blocked cell is enterable.
   */
  moveOnType?: string[];

  activeClasses?: string[];
  cellClasses?: string[];
  containerClasses?: string[];
  rowClasses?: string[];
}
```

Default options (before your `config.options` spread):

```ts
{
  arrowControls: true,
  wasdControls: false,
  infiniteX: false,
  infiniteY: false,
  clickable: true,
  rewindLimit: 20,
  blockOnType: [cellTypeEnum.BARRIER],
  collideOnType: [cellTypeEnum.INTERACTIVE],
  moveOnType: [],
}
```

Use **`cellAttributes`** on **`ICell`** for per-cell attributes; **`activeClasses`** / **`cellClasses`** / **`containerClasses`** / **`rowClasses`** append classes on render.

### `matrix: ICell[][]`

Rows of cells. Each **`ICell`** must include **`type`** (see **`cellTypeEnum`**). Optional **`render`**, **`cellAttributes`**, etc.

```ts
export interface ICell extends IRef {
  type: string;
  render?: (context: ICellContext) => HTMLElement;
  cellAttributes?: string[][];
  eventTypes?: { onEnter: string; onExit: string };
  coords?: number[];
}

interface ICellContext {
  coords: number[];
  cell: ICell;
  gamegrid: IGameGrid;
}
```

### `state: IState`

```ts
export interface IState {
  activeCoords: number[];
  prevCoords: number[];
  moves: number[][];
  rendered?: boolean;
  currentDirection?: string;
}

export type StatePatch = Partial<IState> & Record<string, unknown>;
```

**`setStateSync(patch)`** shallow-merges a **`StatePatch`** into state. **`StatePatch`** still allows arbitrary extra keys for your own bookkeeping.

Initial merge uses **`INITIAL_STATE`** from the package (actual export lives in **`src/enums.ts`**):

```ts
export const INITIAL_STATE: IState = {
  activeCoords: [0, 0],
  prevCoords: [0, 0],
  rendered: false,
  moves: [],
  currentDirection: directionEnum.DOWN,
};
```

### Middleware

**`pre`** runs before the merge; you can mutate the **`patch`** object in place before it is merged.

**`post`** runs after the merge; use **`gamegridInstance.getState()`** for the full merged **`IState`**. The second argument remains the **`patch`** passed to **`setStateSync`**.

## Refs

```ts
export interface IRefsObject {
  container: HTMLElement | null;
  rows: IRow[];
  cells: ICell[][];
}

export interface IRow extends IRef {
  index: number;
  cells: ICell[];
}
```

**`IRow`** can carry a **`current`** **`HTMLDivElement`** for the row when rendered. **`IRefs`** is a deprecated alias for **`IRefsObject`**.

## `IGameGrid` (instance API)

```ts
export interface IGameGrid {
  refs: IRefsObject;
  options: IOptions;

  render(container: HTMLElement): void;
  /** Rebuild DOM from current `matrix` and re-apply active cell UI. Requires a prior render. */
  refresh(): void;
  /** Tear down listeners and DOM when rendered; always emits DESTROYED. */
  destroy(): void;
  getOptions(): IOptions;
  setOptions(newOptions: IOptions): void;

  getState(): IState;
  setStateSync(obj: StatePatch): void;

  getActiveCell(): ICell;
  getPreviousCell(): ICell;
  getCell(coords: readonly [number, number] | number[]): ICell;
  getAllCellsByType(type: string): ICell[];
  setActiveCell(x: number, y: number, direction?: string): void;

  getMatrix(): ICell[][];
  setMatrix(matrix: ICell[][]): void;

  moveUp(): void;
  moveRight(): void;
  moveDown(): void;
  moveLeft(): void;
}
```

The **`GameGrid`** class implements **`IGameGrid`**. The mounted root element is **`refs.container`** after **`render`**; it stays **`null`** on headless constructions until **`render`** runs.

## Events

Events are bubbling **`CustomEvent`s**. Their **`detail`** objects implement **`IGameGridEventDetail`**: at minimum `{ gameGridInstance: IGameGrid }` (plus any extra keys you pass if you call **`fireGameGridEvent`** yourself). For typing listeners, use **`GameGridDOMEvent`** (`CustomEvent<IGameGridEventDetail>`).

By default the grid dispatches on **`window`**. Set **`options.eventTarget`** (for example a dedicated **`EventTarget`**) so multiple grids do not all share the global bus.

**`gameGridEventsEnum`** is an identical compatibility alias — use either name.

```ts
export const gridEventsEnum = {
  // Dispatched after GameGrid.render wires the container (`detail` follows IGameGridEventDetail).
  RENDERED: "gamegrid:grid:rendered",
  // Dispatched at the end of construction (after optional initial render).
  CREATED: "gamegrid:grid:created",
  // Dispatched from GameGrid.destroy; fires even if the grid stayed headless / unmounted.
  DESTROYED: "gamegrid:grid:destroyed",

  // Keyboard / pointer path: onMove already ran; these fire before setActiveCell.
  MOVE_LEFT: "gamegrid:move:left",
  MOVE_RIGHT: "gamegrid:move:right",
  MOVE_UP: "gamegrid:move:up",
  MOVE_DOWN: "gamegrid:move:down",

  // Target rejected by blockOnType or moveOnType allow-list; coords roll back.
  MOVE_BLOCKED: "gamegrid:move:blocked",
  // Entered a collideOnType cell (movement may still succeed).
  MOVE_COLLISION: "gamegrid:move:collide",
  // Left a collide-type cell from the square occupied before this move attempt.
  MOVE_DETTACH: "gamegrid:move:dettach",
  // Finished block/collide/boundary/wrap resolution; mirrors callbacks.onLand.
  MOVE_LAND: "gamegrid:move:land",

  // Aggregate finite-edge clamp — axis BOUNDARY_X / BOUNDARY_Y first when relevant.
  BOUNDARY: "gamegrid:move:boundary",
  // X-axis requested outside row span when infiniteX is off — coordinate clamped.
  BOUNDARY_X: "gamegrid:move:boundary:x",
  // Y-axis requested outside matrix height when infiniteY is off — coordinate clamped.
  BOUNDARY_Y: "gamegrid:move:boundary:y",

  // Aggregate infinite wrap — WRAP_X / WRAP_Y first when relevant.
  WRAP: "gamegrid:move:wrap",
  // Horizontal infinite teleport; runs alongside callbacks.onWrapX.
  WRAP_X: "gamegrid:move:wrap:x",
  // Vertical infinite teleport; runs alongside callbacks.onWrapY.
  WRAP_Y: "gamegrid:move:wrap:y",
};
```

This mirrors **`src/enums.ts`** (same keys and string literals). Import **`gridEventsEnum`** or **`gameGridEventsEnum`** from **`@tamb/gamegrid`** rather than duplicating. **`npm run docs`** expands the same members with full cross-links.

## Instantiation quick start

```ts
import GameGrid, { gridEventsEnum, type GameGridDOMEvent } from "@tamb/gamegrid";

const gg = new GameGrid(
  {
    matrix: myMatrix,
    state: { activeCoords: [0, 0] },
    options: { wasdControls: true },
  },
  document.querySelector("#root")!,
);

gg.moveDown();
window.addEventListener(gridEventsEnum.MOVE_LAND, (e: Event) => {
  const ce = e as GameGridDOMEvent;
  console.log(ce.detail.gameGridInstance);
});
```

For a grid created without a container, call **`render(el)`** when you want DOM.

## Public exports

Besides the **`default`** **`GameGrid`**, the package re-exports:

- Types: **`IConfig`**, **`IOptions`**, **`IState`**, **`IGameGrid`**, **`IGameGridEventDetail`**, **`GameGridDOMEvent`**, **`ICell`**, **`ICellContext`**, **`IRefsObject`**, **`IRow`**, **`IDefaultState`**, **`MiddlewareFn`**, **`StatePatch`**, and deprecated **`IRefs`**
- Values: **`gridEventsEnum`**, **`gameGridEventsEnum`**, **`cellTypeEnum`**, **`classesEnum`**, **`directionEnum`**, **`directionClassEnum`**, **`INITIAL_STATE`**, **`keycodeEnum`**

**`cellTypeEnum`** values are constants on an object (**not** an `enum`). **`classesEnum`** and **`directionEnum`** are TypeScript enums. Example:

```ts
import GameGrid, {
  cellTypeEnum,
  classesEnum,
  directionEnum,
  gridEventsEnum,
} from "@tamb/gamegrid";

// cell — const object:
cellTypeEnum.OPEN;

// enums:
classesEnum.GRID;
directionEnum.DOWN;

// Event name strings — see [Events](#events) for the full map
gridEventsEnum.BOUNDARY === "gamegrid:move:boundary";
```
