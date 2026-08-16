/**
 * Inclusive axis-aligned zoom window in world coordinates.
 *
 * @example
 * ```ts
 * grid.setZoom({ minX: 0, minY: 0, maxX: 3, maxY: 3 });
 * ```
 *
 * @category Zoom
 */
export interface IZoomBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Per-call overrides for {@link GameGrid.setZoom} / {@link GameGrid.clearZoom} / convenience zoom methods.
 *
 * @example
 * ```ts
 * grid.zoomQuadrant("se", { animate: true });
 * grid.clearZoom({ animate: false });
 * ```
 *
 * @category Zoom
 */
export interface IZoomOptions {
  /** Overrides {@link IOptions.animateZoom} for this call only. */
  animate?: boolean;
}

/**
 * A fraction/quadrant tile index within the full grid.
 *
 * @example
 * ```ts
 * const tile = grid.getRegionAt([4, 1], 2);
 * // { divisions: 2, tileX: 1, tileY: 0, quadrant: "ne" } on a 6×6 map
 * ```
 *
 * @category Zoom
 */
export interface IRegionTile {
  divisions: number;
  tileX: number;
  tileY: number;
  /** Present when `divisions === 2`. */
  quadrant?: ZoomQuadrant;
}

/**
 * Cardinal quadrant label when {@link IRegionTile.divisions} is `2`.
 *
 * @example
 * ```ts
 * grid.zoomQuadrant("se");
 * const bounds = grid.getQuadrantZoom("nw");
 * ```
 *
 * @category Zoom
 */
export type ZoomQuadrant = 'nw' | 'ne' | 'sw' | 'se';

/**
 * `activeCoords`, `prevCoords`, and cell `coords` use `[x, y]` → column, then row (`matrix[row][col]` → `matrix[y][x]`).
 *
 * @example
 * ```ts
 * const { activeCoords, moves, future } = grid.getState();
 * grid.setStateSync({ activeCoords: [2, 1] });
 * ```
 *
 * @category State
 */
export interface IState {
  /** Current focus column `x`, then row `y`. Same order as {@link GameGrid.setActiveCell}. */
  activeCoords: number[];
  /** Last position before `activeCoords` updated. */
  prevCoords: number[];
  /**
   * Chronological trail of landed `[x, y]` coords, oldest first.
   * Includes the current cell. Length is capped by {@link IOptions.rewindLimit}.
   * Blocked attempts are not recorded. Use {@link GameGrid.rewind} / {@link GameGrid.rewindTo}.
   */
  moves: number[][];
  /**
   * Oldest-first coords undone by {@link GameGrid.rewind} / {@link GameGrid.rewindTo}.
   * {@link GameGrid.unrewind} / {@link GameGrid.unrewindTo} replay this stack.
   * Cleared when a new cell lands (a real move, click, or {@link GameGrid.moveTo} step).
   * Blocked stays do not clear it.
   */
  future: number[][];
  /** `true` after {@link GameGrid.render}. */
  rendered?: boolean;
  /** Last cardinal direction string (`directionEnum.UP`, `directionEnum.DOWN`, ...). */
  currentDirection?: string;
  /** Current viewport window; `null` when zoom is cleared. */
  zoom: IZoomBounds | null;
  /** Last known region tile when {@link IOptions.regionDivisions} is set; otherwise `null`. */
  region: IRegionTile | null;
}

/**
 * Accepted shape for {@link GameGrid.setStateSync}. Base fields mirror {@link IState};
 * you may attach extra serialisable keys via the index signature.
 *
 * @example
 * ```ts
 * grid.setStateSync({ activeCoords: [1, 2], myMeta: true });
 * ```
 *
 * @category State
 */
export type StatePatch = Partial<IState> & Record<string, unknown>;

/**
 * Extra `detail` keys on {@link gridEventsEnum} `MOVE_*` events (and wrap / boundary events from the same attempt).
 *
 * @remarks
 * - `from` is the active cell before the attempt.
 * - `to` is the candidate cell after wrap / clamp — the tile the attempt tried to occupy.
 *   On a successful land this matches {@link IState.activeCoords}. On a block it is the rejected cell
 *   (active coords stay at `from`). On a finite-edge bump `to` equals `from`.
 * - `blocked` is `true` only when {@link IOptions.blockOnType} / {@link IOptions.moveOnType} rejected the candidate.
 *
 * @example
 * ```ts
 * target.addEventListener(gridEventsEnum.MOVE_BLOCKED, (e: GameGridDOMEvent) => {
 *   const { from, to, direction, blocked } = e.detail;
 *   console.log(`blocked ${direction} ${from} → ${to}`, blocked);
 * });
 * ```
 *
 * @category Events
 */
export interface IMoveEventDetail {
  from: number[];
  to: number[];
  direction?: string;
  blocked: boolean;
  [key: string]: unknown;
}

/**
 * `CustomEvent.detail` for every bubbling grid DOM event constructed by the internal `fireGameGridEvent` helper used in {@link GameGrid}.
 *
 * @remarks `gameGridInstance` is always present. {@link IMoveEventDetail} fields are set on `MOVE_*` (and wrap / boundary) events. The index signature reserves space for callers who forward extra fields via that helper's `data` argument.
 *
 * @example
 * ```ts
 * window.addEventListener(gridEventsEnum.MOVE_LAND, (e: Event) => {
 *   const { gameGridInstance } = (e as GameGridDOMEvent).detail;
 *   console.log(gameGridInstance.getActiveCell().type);
 * });
 * ```
 *
 * @category Events
 */
export interface IGameGridEventDetail extends Partial<IMoveEventDetail>, Record<string, unknown> {
  /** The emitting grid (`this` inside {@link GameGrid}). */
  gameGridInstance: IGameGrid;
}

/**
 * Narrow type for listeners bound to {@link gridEventsEnum} strings.
 *
 * @example
 * ```ts
 * const target = grid.options.eventTarget ?? window;
 * target.addEventListener(gridEventsEnum.CREATED, (e: Event) => {
 *   const ce = e as GameGridDOMEvent;
 *   ce.detail.gameGridInstance.getState();
 * });
 * ```
 *
 * @category Events
 */
export type GameGridDOMEvent = CustomEvent<IGameGridEventDetail>;

/**
 * Allowed fields when merging initial grid {@link GameGrid} state.
 *
 * @example
 * ```ts
 * const grid = new GameGrid({
 *   matrix,
 *   state: { activeCoords: [1, 0], currentDirection: directionEnum.RIGHT },
 * });
 * ```
 *
 * @category State
 */
export interface IDefaultState {
  activeCoords?: number[];
  prevCoords?: number[];
  currentDirection?: string;
  moves?: number[][];
  future?: number[][];
  rendered?: boolean;
  zoom?: IZoomBounds | null;
  region?: IRegionTile | null;
}

/**
 * Public contract implemented by {@link GameGrid}.
 *
 * @remarks
 * Methods stay flat on the instance. Docs group them by **job** (not DOM vs data):
 * **Matrix** (logical cells), **Movement** (focus and history), **View** (optional markup),
 * **State**, **Options**, and **Zoom**.
 *
 * {@link GameGrid.setCell} / {@link GameGrid.setMatrix} write the matrix only.
 * {@link GameGrid.refreshCells} / {@link GameGrid.refresh} / {@link GameGrid.render} paint.
 * Movement updates state and events; it highlights when mounted.
 *
 * For DOM events (`CustomEvent`s), see {@link IGameGridEventDetail} and {@link gridEventsEnum}.
 *
 * @groupDescription Matrix
 * Logical grid data. {@link GameGrid.setCell} and {@link GameGrid.setMatrix} do not paint.
 * Call a View method when mounted nodes should catch up. {@link GameGrid.getActiveCell} /
 * {@link GameGrid.getPreviousCell} read matrix fields immediately and overlay `current` from refs.
 *
 * @groupDescription Movement
 * Focus and history. Updates {@link IState}, fires callbacks and {@link gridEventsEnum} events,
 * and highlights the active cell when rendered. Not a matrix write.
 *
 * @groupDescription View
 * Mount, paint, and tear down markup. Optional — omit the constructor container and skip
 * {@link GameGrid.render} for headless use. {@link GameGrid.refreshCells} also writes the matrix
 * when `cell` is provided.
 *
 * @groupDescription State
 * Authoritative {@link IState}. {@link GameGrid.setStateSync} runs middleware and does not emit
 * grid `CustomEvent`s.
 *
 * @groupDescription Options
 * Runtime behaviour toggles. {@link GameGrid.setOptions} does not swap the matrix or re-render.
 *
 * @groupDescription Zoom
 * Viewport window and region tiles. Applying zoom rebuilds the visible window when mounted.
 *
 * @showGroups
 * @category Grid contract
 *
 * @example Construct, move, and listen
 * ```ts
 * import GameGrid, { cellTypeEnum, gridEventsEnum, type GameGridDOMEvent } from "@tamb/gamegrid";
 *
 * const matrix = [
 *   [{ type: cellTypeEnum.OPEN }, { type: cellTypeEnum.BARRIER }],
 *   [{ type: cellTypeEnum.OPEN }, { type: cellTypeEnum.OPEN }],
 * ];
 *
 * const grid = new GameGrid(
 *   { matrix, options: { wasdControls: true } },
 *   document.querySelector("#root")!,
 * );
 *
 * grid.moveDown();
 * window.addEventListener(gridEventsEnum.MOVE_LAND, (e: Event) => {
 *   const { gameGridInstance } = (e as GameGridDOMEvent).detail;
 *   console.log(gameGridInstance.getActiveCell().type);
 * });
 * ```
 */
export interface IGameGrid {
  /**
   * After {@link GameGrid.render}, hydrated rows/cells and `container`. Headless grids mirror `cells` onto the logical matrix until mount.
   * @group View
   * @example
   * ```ts
   * const root = grid.refs.container; // HTMLElement after render, null while headless
   * ```
   */
  refs: IRefsObject;
  /**
   * Runtime toggles: input, collisions, middleware, callbacks, styling. Merged from ctor defaults and {@link GameGrid.setOptions}.
   * @group Options
   * @example
   * ```ts
   * grid.options.wasdControls; // current merged value
   * grid.setOptions({ wasdControls: true });
   * ```
   */
  options: IOptions;

  /**
   * Mount markup into `container`, wire keyboard/pointer handlers, and highlight the current active cell.
   *
   * @remarks Clears/rebuilds refs for this mount. Prefer {@link GameGrid.refresh} after the first paint when rebuilding from the same host. Dispatches {@link gridEventsEnum.RENDERED} once the container is patched and listeners attach. Does **not** call {@link GameGrid.setActiveCell} — no move / collide / land / {@link ICell.eventTypes} events, and `currentDirection` is left as-is. Skips stylesheet injection when {@link IOptions.injectStyles} is `false`.
   * @group View
   * @example Headless first, then mount
   * ```ts
   * const grid = new GameGrid({ matrix });
   * grid.moveRight();
   * grid.render(document.querySelector("#stage")!);
   * ```
   */
  render(container: HTMLElement): void;

  /**
   * Tear down handlers, wipe `container`, rebuild rows/cells from {@link GameGrid.getMatrix}, reattach handlers.
   *
   * @throws When {@link IRefsObject.container} is missing (never rendered successfully).
   * @remarks Does not dispatch {@link gridEventsEnum.RENDERED}; that event is emitted from {@link GameGrid.render}. Honors {@link IOptions.injectStyles} the same way as {@link GameGrid.render}.
   * @group View
   * @example After swapping the matrix
   * ```ts
   * grid.setMatrix(nextRows);
   * grid.refresh();
   * ```
   */
  refresh(): void;

  /**
   * Write optional cell data and rebuild one or more cell nodes from the current matrix.
   *
   * @param cells - A single {@link ICellRefresh} or an array. `cell` is written with {@link GameGrid.setCell} when provided; omit it to re-render the existing matrix entry.
   * @remarks **Flow:** {@link GameGrid.setCell} is data-only (movement reads the new `type` immediately; DOM/`refs` stay stale). Call this afterward with `{ coords }` to paint those tiles, or pass `{ coords, cell }` to write and paint in one step. Headless grids update matrix data only. Off-screen cells under zoom stay `current: null`. Does not rebuild the whole grid — use {@link GameGrid.refresh} when dimensions or the zoom window change. Dispatches {@link gridEventsEnum.CELLS_REFRESHED} once with `detail.cells`.
   * @group View
   * @example Two-step write then paint
   * ```ts
   * grid.setCell([2, 0], { type: cellTypeEnum.OPEN });
   * grid.refreshCells({ coords: [2, 0] });
   * ```
   * @example One-step write and paint
   * ```ts
   * grid.refreshCells({ coords: [1, 1], cell: { type: cellTypeEnum.BARRIER } });
   * ```
   */
  refreshCells(cells: ICellRefresh | ICellRefresh[]): void;

  /**
   * Detach listeners when rendered and clear injected structure; resets `rendered` in state via {@link GameGrid.setStateSync}.
   *
   * @remarks Idempotent-friendly: always dispatches {@link gridEventsEnum.DESTROYED} whether or not DOM was present. Middleware `pre` / `post` run for the `rendered: false` patch.
   * @group View
   * @example
   * ```ts
   * grid.destroy();
   * ```
   */
  destroy(): void;

  /**
   * Snapshot merged {@link IOptions} — updates after {@link GameGrid.setOptions}.
   * @group Options
   * @example
   * ```ts
   * const { wasdControls, moveDebounce } = grid.getOptions();
   * ```
   */
  getOptions(): IOptions;

  /**
   * Cell at {@link IState.prevCoords}: matrix data (same source as {@link GameGrid.getCell}) plus mounted `current` / `coords` from refs when rendered.
   * @group Matrix
   * @example
   * ```ts
   * const prev = grid.getPreviousCell();
   * console.log(prev.type, prev.coords);
   * ```
   */
  getPreviousCell(): ICell;

  /**
   * Cell at {@link IState.activeCoords}: matrix data (same source as {@link GameGrid.getCell}) plus mounted `current` / `coords` from refs when rendered.
   *
   * @remarks After {@link GameGrid.setCell}, `type` and other data fields match the matrix immediately. The painted node on `current` stays stale until {@link GameGrid.refreshCells} / {@link GameGrid.refresh}.
   * @group Matrix
   * @example
   * ```ts
   * const tile = grid.getActiveCell();
   * console.log(tile.type, tile.current); // current is the mounted node when rendered
   * ```
   */
  getActiveCell(): ICell;

  /**
   * Move focus `(x,y)` when {@link IOptions.blockOnType}, {@link IOptions.collideOnType}, {@link IOptions.moveOnType}, and bounds/wrap rules allow.
   *
   * @remarks **Dispatch order (subset may apply):** {@link gridEventsEnum.MOVE_BLOCKED} if blocked; {@link gridEventsEnum.MOVE_COLLISION} when entering a collide-type cell; {@link gridEventsEnum.MOVE_DETTACH} when leaving a collide-type cell for a non-collide cell; {@link ICell.eventTypes} `onExit` then `onEnter` when the active cell changes; axis {@link gridEventsEnum.WRAP_X} / {@link gridEventsEnum.WRAP_Y} / {@link gridEventsEnum.BOUNDARY_X} / {@link gridEventsEnum.BOUNDARY_Y}; aggregate {@link gridEventsEnum.WRAP} / {@link gridEventsEnum.BOUNDARY}; finally {@link gridEventsEnum.MOVE_LAND} (pairs with the `onLand` member of {@link IOptions.callbacks}) only when the active cell actually changes. Move events carry {@link IMoveEventDetail} (`from`, `to`, `direction`, `blocked`). {@link GameGrid.render} does not call this method.
   * @group Movement
   * @example
   * ```ts
   * grid.setActiveCell(2, 1, directionEnum.RIGHT);
   * ```
   */
  setActiveCell(x: number, y: number, direction?: string): void;

  /**
   * Accumulate every {@link ICell.type} matching `type` scanning row-major from {@link GameGrid.getMatrix}.
   * @group Matrix
   * @example
   * ```ts
   * const barriers = grid.getAllCellsByType(cellTypeEnum.BARRIER);
   * ```
   */
  getAllCellsByType(type: string): ICell[];

  /**
   * Logical matrix backing the grid (`matrix[row][column]` ⇒ `matrix[y][x]`).
   * @group Matrix
   * @example
   * ```ts
   * const rows = grid.getMatrix();
   * const cell = rows[1][2]; // row 1, column 2 — same as getCell([2, 1])
   * ```
   */
  getMatrix(): ICell[][];

  /**
   * Replace logical matrix reference; callers must {@link GameGrid.refresh} or {@link GameGrid.render} to reconcile DOM when mounted.
   *
   * @remarks Headless grids also alias {@link IRefsObject.cells} to the new matrix so {@link GameGrid.getActiveCell} stays in sync.
   * @group Matrix
   * @example
   * ```ts
   * grid.setMatrix(nextRows);
   * if (grid.getState().rendered) grid.refresh();
   * ```
   */
  setMatrix(matrix: ICell[][]): void;

  /**
   * Logical cell from {@link GameGrid.getMatrix}: `matrix[coords[1]][coords[0]]` — raw matrix lookup (bounds unchecked).
   * @param coords - `[x, y]`.
   * @group Matrix
   * @example
   * ```ts
   * const cell = grid.getCell([2, 1]); // column 2, row 1
   * ```
   */
  getCell(coords: readonly [number, number] | number[]): ICell;

  /**
   * Replace the logical cell at `coords` (`matrix[y][x]`). Does not render, refresh, or patch DOM/`refs`.
   *
   * @param coords - `[x, y]`.
   * @param cell - Stored by reference, same as {@link GameGrid.setMatrix}.
   * @remarks Bounds unchecked, matching {@link GameGrid.getCell}. Data-only: does not patch DOM, `refs`, or emit events. Movement / `blockOnType` read the new cell immediately. Call {@link GameGrid.refreshCells} with `{ coords }` (or `{ coords, cell }` instead of this method) to update mounted nodes; use {@link GameGrid.refresh} / {@link GameGrid.render} when the grid shape changes.
   * @group Matrix
   * @example
   * ```ts
   * grid.setCell([2, 1], { type: cellTypeEnum.INTERACTIVE });
   * grid.refreshCells({ coords: [2, 1] }); // paint if mounted
   * ```
   */
  setCell(coords: readonly [number, number] | number[], cell: ICell): void;

  /**
   * Shallow-merge behaviours into {@link IGameGrid.options} without swapping the matrix snapshot or re-rendering.
   * @group Options
   * @example Speed power-up
   * ```ts
   * grid.setOptions({ moveDebounce: 40, wasdControls: true });
   * ```
   */
  setOptions(newOptions: IOptions): void;

  /**
   * Authoritative {@link IState} backing movement callbacks and renders.
   * @group State
   * @example
   * ```ts
   * const { activeCoords, moves, future } = grid.getState();
   * ```
   */
  getState(): IState;

  /**
   * Apply partial state with {@link MiddlewareFn} **`pre`** (mutate patch) → merge → **`post`**.
   *
   * @remarks Middleware runs around the merge inside this call; does not emit grid `CustomEvent`s.
   * @group State
   * @example
   * ```ts
   * grid.setStateSync({ activeCoords: [1, 0], myScore: 3 });
   * ```
   */
  setStateSync(obj: StatePatch): void;

  /**
   * Directional move: invokes the `onMove` member of {@link IOptions.callbacks} → dispatches {@link gridEventsEnum.MOVE_UP} (with {@link IMoveEventDetail}) → {@link GameGrid.setActiveCell}.
   * @group Movement
   * @example
   * ```ts
   * grid.moveUp();
   * ```
   */
  moveUp(): void;

  /**
   * @remarks Dispatches {@link gridEventsEnum.MOVE_RIGHT} (with {@link IMoveEventDetail}) before {@link GameGrid.setActiveCell}.
   * @group Movement
   * @example
   * ```ts
   * grid.moveRight();
   * ```
   */
  moveRight(): void;

  /**
   * @remarks Dispatches {@link gridEventsEnum.MOVE_DOWN} (with {@link IMoveEventDetail}) before {@link GameGrid.setActiveCell}.
   * @group Movement
   * @example
   * ```ts
   * grid.moveDown();
   * ```
   */
  moveDown(): void;

  /**
   * @remarks Dispatches {@link gridEventsEnum.MOVE_LEFT} (with {@link IMoveEventDetail}) before {@link GameGrid.setActiveCell}.
   * @group Movement
   * @example
   * ```ts
   * grid.moveLeft();
   * ```
   */
  moveLeft(): void;

  /**
   * Walk to one cell, or along an explicit list of cells, through {@link GameGrid.setActiveCell}.
   *
   * @param coordsOrPath - A single `[x, y]` or an array of `[x, y]` steps. Not pathfinding (no A*): gaps teleport.
   * @remarks Each step uses the existing block / collide / wrap / zoom-edge rules. Stops when a step does not land on the requested cell (blocked, finite-edge clamp, or wrap to a different cell). Skips steps that are already the active cell. Not rate-limited by {@link IOptions.moveDebounce}. Does not dispatch directional {@link gridEventsEnum.MOVE_UP} / `MOVE_RIGHT` / `MOVE_DOWN` / `MOVE_LEFT` (same as a cell click).
   * @group Movement
   * @example One cell
   * ```ts
   * grid.moveTo([2, 1]);
   * ```
   * @example Explicit path
   * ```ts
   * grid.moveTo([
   *   [0, 1],
   *   [0, 2],
   *   [1, 2],
   * ]);
   * ```
   */
  moveTo(
    coordsOrPath:
      | readonly [number, number]
      | number[]
      | Array<readonly [number, number] | number[]>,
  ): void;

  /**
   * Step back `steps` entries in {@link IState.moves} (default `1`).
   *
   * @remarks No-op when there is no earlier position, or `steps` is not a positive finite number.
   * Extra steps clamp to the oldest remaining entry. Not rate-limited by {@link IOptions.moveDebounce}.
   * Dispatches {@link gridEventsEnum.REWIND} (with `detail.steps` / `detail.index` plus {@link IMoveEventDetail}) then {@link gridEventsEnum.MOVE_LAND}.
   * Dropped coords are pushed onto {@link IState.future} so {@link GameGrid.unrewind} can replay them.
   * @group Movement
   * @example
   * ```ts
   * grid.moveDown();
   * grid.moveRight();
   * grid.rewind();  // back one step
   * grid.rewind(2); // back two steps (clamps to the oldest remaining)
   * ```
   */
  rewind(steps?: number): void;

  /**
   * Jump to `index` in {@link IState.moves} (`0` = oldest remaining).
   *
   * @remarks No-op when `index` is not an integer in range, or it is already the current (last) entry.
   * Truncates history after the chosen index (later entries move to {@link IState.future}). Same events as {@link GameGrid.rewind}.
   * @group Movement
   * @example
   * ```ts
   * grid.rewindTo(0); // jump to the oldest remaining history entry
   * ```
   */
  rewindTo(index: number): void;

  /**
   * Replay `steps` entries from {@link IState.future} (default `1`). Redo after {@link GameGrid.rewind}.
   *
   * @remarks No-op when the forward stack is empty, or `steps` is not a positive finite number.
   * Extra steps clamp to the newest remaining future entry. Not rate-limited by {@link IOptions.moveDebounce}.
   * Dispatches {@link gridEventsEnum.UNREWIND} (with `detail.steps` / `detail.index` plus {@link IMoveEventDetail}) then {@link gridEventsEnum.MOVE_LAND}.
   * @group Movement
   * @example
   * ```ts
   * grid.rewind();
   * grid.unrewind(); // redo that step
   * ```
   */
  unrewind(steps?: number): void;

  /**
   * Jump forward to `index` in the combined trail (`moves` then `future`).
   *
   * @remarks `index` is counted from the oldest remaining {@link IState.moves} entry (`0`), through the current cell, into {@link IState.future}.
   * No-op when `index` is not an integer strictly ahead of the current entry, or past the newest future coord.
   * Same events as {@link GameGrid.unrewind}.
   * @group Movement
   * @example
   * ```ts
   * grid.rewind(3);
   * grid.unrewindTo(2); // jump forward in the combined moves + future trail
   * ```
   */
  unrewindTo(index: number): void;

  /**
   * Current zoom bounds or `null` when no zoom is active.
   * @group Zoom
   * @example
   * ```ts
   * const zoom = grid.getZoom(); // { minX, minY, maxX, maxY } or null
   * ```
   */
  getZoom(): IZoomBounds | null;

  /**
   * Apply a zoom window in world coordinates.
   *
   * @remarks Clamps `activeCoords` into bounds when outside. Dispatches {@link gridEventsEnum.ZOOM_SET}.
   * @group Zoom
   * @example
   * ```ts
   * grid.setZoom({ minX: 0, minY: 0, maxX: 3, maxY: 3 }, { animate: true });
   * ```
   */
  setZoom(bounds: IZoomBounds, options?: IZoomOptions): void;

  /**
   * Clear the zoom window. Dispatches {@link gridEventsEnum.ZOOM_CLEARED}.
   * @group Zoom
   * @example
   * ```ts
   * grid.clearZoom({ animate: true });
   * ```
   */
  clearZoom(options?: IZoomOptions): void;

  /**
   * Compute zoom bounds around a center cell ± radii, clipped to the matrix.
   * @group Zoom
   * @example
   * ```ts
   * const bounds = grid.getZoomAround([2, 2], 1); // 3×3 window around [2, 2]
   * ```
   */
  getZoomAround(
    center: readonly [number, number] | number[],
    radiusX: number,
    radiusY?: number,
  ): IZoomBounds;

  /**
   * Compute zoom bounds for a quadrant (`divisions === 2`).
   * @group Zoom
   * @example
   * ```ts
   * const se = grid.getQuadrantZoom("se");
   * ```
   */
  getQuadrantZoom(quadrant: ZoomQuadrant): IZoomBounds;

  /**
   * Compute zoom bounds for a fraction tile (`divisions×divisions` grid).
   * @group Zoom
   * @example
   * ```ts
   * const tile = grid.getFractionZoom(3, 1, 1); // center ninth
   * ```
   */
  getFractionZoom(divisions: number, tileX: number, tileY: number): IZoomBounds;

  /**
   * Compute bounds then {@link GameGrid.setZoom}.
   * @group Zoom
   * @example
   * ```ts
   * grid.zoomAround([2, 2], 1, 1, { animate: true });
   * ```
   */
  zoomAround(
    center: readonly [number, number] | number[],
    radiusX: number,
    radiusY?: number,
    options?: IZoomOptions,
  ): void;

  /**
   * Compute quadrant bounds then {@link GameGrid.setZoom}.
   * @group Zoom
   * @example
   * ```ts
   * grid.zoomQuadrant("se");
   * ```
   */
  zoomQuadrant(quadrant: ZoomQuadrant, options?: IZoomOptions): void;

  /**
   * Compute fraction bounds then {@link GameGrid.setZoom}.
   * @group Zoom
   * @example
   * ```ts
   * grid.zoomFraction(3, 0, 1);
   * ```
   */
  zoomFraction(divisions: number, tileX: number, tileY: number, options?: IZoomOptions): void;

  /**
   * Region tile for `coords`; `divisions` defaults to {@link IOptions.regionDivisions}.
   * @group Zoom
   * @example
   * ```ts
   * const region = grid.getRegionAt([4, 1], 2);
   * ```
   */
  getRegionAt(coords: readonly [number, number] | number[], divisions?: number): IRegionTile;

  /**
   * {@link IState.region} or computed from the active cell when region tracking is enabled.
   * @group Zoom
   * @example
   * ```ts
   * const current = grid.getActiveRegion();
   * ```
   */
  getActiveRegion(): IRegionTile | null;
}

/**
 * Runs for each entry in {@link IOptions.middlewares}.
 *
 * @param gamegridInstance - Live grid receiving the merge.
 * @param patch - Shallow merge payload; **`pre`** may mutate fields in-place before {@link GameGrid.setStateSync} merges.
 *
 * @example
 * ```ts
 * const grid = new GameGrid({
 *   matrix,
 *   options: {
 *     middlewares: {
 *       post: [(gg, patch) => console.log('next', gg.getState(), patch)],
 *     },
 *   },
 * });
 * ```
 *
 * @category Configuration
 */
export type MiddlewareFn = (gamegridInstance: IGameGrid, patch: StatePatch) => void;

/**
 * Runtime behaviour toggles, collision rules, middleware, callbacks, styling, and event routing.
 *
 * @example
 * ```ts
 * const grid = new GameGrid({
 *   matrix,
 *   options: {
 *     wasdControls: true,
 *     infiniteX: true,
 *     blockOnType: [cellTypeEnum.BARRIER],
 *     eventTarget: new EventTarget(),
 *   },
 * });
 * ```
 *
 * @category Configuration
 */
export interface IOptions {
  id?: string;
  /**
   * Target for dispatched `CustomEvent`s carrying grid `detail`; defaults to `window` when available.
   * @remarks Use a standalone `EventTarget` (or `HTMLElement`) when hosting multiple grids.
   * @example
   * ```ts
   * const bus = new EventTarget();
   * const grid = new GameGrid({ matrix, options: { eventTarget: bus } });
   * bus.addEventListener(gridEventsEnum.MOVE_LAND, handler);
   * ```
   */
  eventTarget?: EventTarget;
  arrowControls?: boolean;
  wasdControls?: boolean;
  /**
   * Milliseconds to wait before accepting another directional move.
   * - `number`: shared cooldown for any direction
   * - `[Top, Right, Down, Left]`: per-direction cooldowns (UP, RIGHT, DOWN, LEFT)
   *
   * @remarks Update at runtime via {@link GameGrid.setOptions} (no re-render required). Useful for
   * temporary speed boosts such as power-ups.
   * @example Shared cooldown
   * ```ts
   * new GameGrid({ matrix, options: { moveDebounce: 120 } });
   * ```
   * @example Per-direction cooldown
   * ```ts
   * grid.setOptions({ moveDebounce: [80, 40, 80, 40] }); // UP, RIGHT, DOWN, LEFT
   * ```
   */
  moveDebounce?: number | [number, number, number, number];
  infiniteX?: boolean;
  infiniteY?: boolean;
  clickable?: boolean;
  /**
   * Max length of {@link IState.moves}. Oldest entries drop first.
   * Values below `1` are treated as `1` (always keep the current cell). Default: `20`.
   */
  rewindLimit?: number;
  /**
   * @example
   * ```ts
   * new GameGrid({
   *   matrix,
   *   options: {
   *     middlewares: {
   *       pre: [(_gg, patch) => { patch.myTick = Date.now(); }],
   *       post: [(gg) => console.log(gg.getState())],
   *     },
   *   },
   * });
   * ```
   */
  middlewares?: {
    /** Invoked synchronously **before** the patch merges into {@link IState} (see {@link MiddlewareFn}). */
    pre?: MiddlewareFn[];
    /** Invoked after merge; inspect merged state via {@link GameGrid.getState}. */
    post?: MiddlewareFn[];
  };
  /**
   * @example
   * ```ts
   * new GameGrid({
   *   matrix,
   *   options: {
   *     callbacks: {
   *       onLand: (gg) => console.log("landed", gg.getState().activeCoords),
   *       onBlock: (gg) => console.log("blocked at", gg.getActiveCell().type),
   *     },
   *   },
   * });
   * ```
   */
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
    onZoomSet?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onZoomCleared?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onZoomEdge?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onZoomExit?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onRegionChange?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onRewind?: (gamegridInstance: IGameGrid, newState: IState) => void;
    onUnrewind?: (gamegridInstance: IGameGrid, newState: IState) => void;
  };

  /** Default whether zoom transitions animate. Overridden by {@link IZoomOptions.animate}. Default: `false`. */
  animateZoom?: boolean;

  /**
   * When zoom is set, keep movement inside the zoom window.
   * @remarks `true` (default): clamp/wrap to zoom; attempts past the window emit {@link gridEventsEnum.ZOOM_EDGE}.
   * `false`: full-matrix movement; leaving the window emits {@link gridEventsEnum.ZOOM_EXIT}.
   */
  constrainToZoom?: boolean;

  /**
   * Opt-in region tracking. `2` = quadrants, `3` = ninths, etc.
   * @remarks Moves that change tile emit {@link gridEventsEnum.REGION_CHANGE} and update {@link IState.region}.
   * @example
   * ```ts
   * const grid = new GameGrid({ matrix, options: { regionDivisions: 2 } });
   * grid.zoomQuadrant("se");
   * ```
   */
  regionDivisions?: number;

  /** CSS transition duration (ms) for zoom slide. Default: `300`. */
  zoomSlideDuration?: number;

  /**
   * When `true` with {@link IOptions.regionDivisions}, {@link gridEventsEnum.ZOOM_EDGE} auto-zooms to the adjacent region tile.
   * Default: `false`.
   * @example
   * ```ts
   * new GameGrid({
   *   matrix,
   *   options: { regionDivisions: 2, slideZoomOnEdge: true, animateZoom: true },
   * });
   * ```
   */
  slideZoomOnEdge?: boolean;

  /** Appended to `.gamegrid__viewport` whenever zoom is active. */
  zoomViewportClasses?: string[];

  /**
   * When `true` (default), {@link GameGrid.render} and {@link GameGrid.refresh} inject bundled
   * layout CSS into `document.head` once (guarded by `style[data-gamegrid-styles]`).
   * Set `false` to skip injection and style `.gamegrid` yourself.
   * @example
   * ```ts
   * new GameGrid({ matrix, options: { injectStyles: false } }, root);
   * ```
   */
  injectStyles?: boolean;

  /** Cell `type` values that cannot be entered; movement snaps back to the previous cell. */
  blockOnType?: string[];
  /** Cell types that emit collision events upon entry (movement still succeeds unless blocked). */
  collideOnType?: string[];
  /**
   * Allow-list of enterable {@link ICell.type} values when non-empty.
   * @remarks Omit or supply `[]` to allow any cell that passes `blockOnType`.
   */
  moveOnType?: string[];

  activeClasses?: string[];
  cellClasses?: string[];
  containerClasses?: string[];
  rowClasses?: string[];
}

/**
 * Constructor bundle for {@link GameGrid}.
 *
 * @example
 * ```ts
 * const gg = new GameGrid({ matrix: rowsOfCells, options: { infiniteX: true }, state: { activeCoords: [3, 0] } }, rootEl);
 * ```
 *
 * @category Configuration
 */
export interface IConfig {
  options?: IOptions;
  matrix: ICell[][];
  state?: IDefaultState | IState;
}

/** Optional pointer to rendered DOM wrappers. */
export interface IRef {
  current?: HTMLDivElement | null;
}

/**
 * Passed to {@link ICell.render} for custom cell markup.
 *
 * @example
 * ```ts
 * const cell: ICell = {
 *   type: cellTypeEnum.OPEN,
 *   render({ coords, cell, gamegrid }) {
 *     const el = document.createElement("span");
 *     el.textContent = `${cell.type} @ ${coords.join(",")}`;
 *     el.dataset.active = String(gamegrid.getState().activeCoords.join(",") === coords.join(","));
 *     return el;
 *   },
 * };
 * ```
 *
 * @category Data model
 */
export interface ICellContext {
  /** Active cell focus as `[x, y]` (matches `data-gamegrid-coords` and {@link GameGrid.getMatrix} column/row order). */
  coords: number[];
  cell: ICell;
  gamegrid: IGameGrid;
}

/**
 * Declarative cell definition inside {@link IConfig.matrix}.
 *
 * After render, hydrated cells decorate `current`/`coords` internally.
 *
 * @example Minimal open tile
 * ```ts
 * { type: cellTypeEnum.OPEN }
 * ```
 *
 * @example Custom markup
 * ```ts
 * {
 *   type: cellTypeEnum.OPEN,
 *   render({ cell, coords }) {
 *     const span = document.createElement('span');
 *     span.textContent = coords.join(",");
 *     return span;
 *   },
 * }
 * ```
 *
 * @category Data model
 */
export interface ICell extends IRef {
  type: string;
  render?: (context: ICellContext) => HTMLElement;
  cellAttributes?: string[][];
  /**
   * Custom event names dispatched on {@link IOptions.eventTarget} when the active cell **changes**.
   * `onExit` fires for the previous cell, then `onEnter` for the landed cell.
   * Extra `detail` keys: `coords`, `cell`. Blocked stays and {@link GameGrid.render} do not fire these.
   * @example
   * ```ts
   * const door: ICell = {
   *   type: cellTypeEnum.INTERACTIVE,
   *   eventTypes: { onEnter: "door:enter", onExit: "door:exit" },
   * };
   * window.addEventListener("door:enter", (e: Event) => {
   *   const { coords, cell } = (e as GameGridDOMEvent).detail;
   *   console.log("entered", coords, cell);
   * });
   * ```
   */
  eventTypes?: {
    onEnter: string;
    onExit: string;
  };
  coords?: number[];
  /** App-specific fields (coins, metadata, …) are allowed and survive {@link GameGrid.getActiveCell} / {@link GameGrid.getCell}. */
  [key: string]: unknown;
}

/**
 * One tile for {@link GameGrid.refreshCells}: identity plus optional replacement data.
 *
 * @example Two-step: setCell then paint
 * ```ts
 * grid.setCell([1, 2], { type: cellTypeEnum.OPEN });
 * grid.refreshCells({ coords: [1, 2] });
 * ```
 *
 * @example One-step write and paint
 * ```ts
 * grid.refreshCells({ coords: [1, 2], cell: { type: cellTypeEnum.OPEN } });
 * ```
 *
 * @category Data model
 */
export interface ICellRefresh {
  /** World `[x, y]` — same order as {@link GameGrid.setCell}. */
  coords: readonly [number, number] | number[];
  /** When provided, stored on the matrix before the cell node is rebuilt. */
  cell?: ICell;
}

/**
 * Describes a rendered row plus associated {@link ICell} metadata.
 *
 * @example
 * ```ts
 * const firstRow = grid.refs.rows[0];
 * firstRow.current?.classList.add("hud-row");
 * ```
 *
 * @category References
 */
export interface IRow extends IRef {
  index: number;
  cells: ICell[];
}

/**
 * Live references after {@link GameGrid.render}; `cells[y][x]` matches {@link GameGrid.getMatrix}.
 *
 * @example
 * ```ts
 * const root = grid.refs.container;
 * const painted = grid.refs.cells[0][1]?.current; // mounted node at [1, 0]
 * ```
 *
 * @category References
 */
export interface IRefsObject {
  container: HTMLElement | null;
  rows: IRow[];
  cells: ICell[][];
}

/**
 * @deprecated Use {@link IRefsObject}; identical alias retained for transitional typings.
 *
 * @category References
 */
export type IRefs = IRefsObject;
