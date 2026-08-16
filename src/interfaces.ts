/**
 * Inclusive axis-aligned zoom window in world coordinates.
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
 * @category Zoom
 */
export interface IZoomOptions {
  /** Overrides {@link IOptions.animateZoom} for this call only. */
  animate?: boolean;
}

/**
 * A fraction/quadrant tile index within the full grid.
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
 * @category Zoom
 */
export type ZoomQuadrant = 'nw' | 'ne' | 'sw' | 'se';

/**
 * `activeCoords`, `prevCoords`, and cell `coords` use `[x, y]` → column, then row (`matrix[row][col]` → `matrix[y][x]`).
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
 * @category Events
 */
export interface IGameGridEventDetail extends Partial<IMoveEventDetail>, Record<string, unknown> {
  /** The emitting grid (`this` inside {@link GameGrid}). */
  gameGridInstance: IGameGrid;
}

/**
 * Narrow type for listeners bound to {@link gridEventsEnum} strings.
 *
 * @category Events
 */
export type GameGridDOMEvent = CustomEvent<IGameGridEventDetail>;

/**
 * Allowed fields when merging initial grid {@link GameGrid} state.
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
 */
export interface IGameGrid {
  /**
   * After {@link GameGrid.render}, hydrated rows/cells and `container`. Headless grids mirror `cells` onto the logical matrix until mount.
   * @group View
   */
  refs: IRefsObject;
  /**
   * Runtime toggles: input, collisions, middleware, callbacks, styling. Merged from ctor defaults and {@link GameGrid.setOptions}.
   * @group Options
   */
  options: IOptions;

  /**
   * Mount markup into `container`, wire keyboard/pointer handlers, and highlight the current active cell.
   *
   * @remarks Clears/rebuilds refs for this mount. Prefer {@link GameGrid.refresh} after the first paint when rebuilding from the same host. Dispatches {@link gridEventsEnum.RENDERED} once the container is patched and listeners attach. Does **not** call {@link GameGrid.setActiveCell} — no move / collide / land / {@link ICell.eventTypes} events, and `currentDirection` is left as-is.
   * @group View
   */
  render(container: HTMLElement): void;

  /**
   * Tear down handlers, wipe `container`, rebuild rows/cells from {@link GameGrid.getMatrix}, reattach handlers.
   *
   * @throws When {@link IRefsObject.container} is missing (never rendered successfully).
   * @remarks Does not dispatch {@link gridEventsEnum.RENDERED}; that event is emitted from {@link GameGrid.render}.
   * @group View
   */
  refresh(): void;

  /**
   * Write optional cell data and rebuild one or more cell nodes from the current matrix.
   *
   * @param cells - A single {@link ICellRefresh} or an array. `cell` is written with {@link GameGrid.setCell} when provided; omit it to re-render the existing matrix entry.
   * @remarks **Flow:** {@link GameGrid.setCell} is data-only (movement reads the new `type` immediately; DOM/`refs` stay stale). Call this afterward with `{ coords }` to paint those tiles, or pass `{ coords, cell }` to write and paint in one step. Headless grids update matrix data only. Off-screen cells under zoom stay `current: null`. Does not rebuild the whole grid — use {@link GameGrid.refresh} when dimensions or the zoom window change. Dispatches {@link gridEventsEnum.CELLS_REFRESHED} once with `detail.cells`.
   * @group View
   */
  refreshCells(cells: ICellRefresh | ICellRefresh[]): void;

  /**
   * Detach listeners when rendered and clear injected structure; resets `rendered` in state via {@link GameGrid.setStateSync}.
   *
   * @remarks Idempotent-friendly: always dispatches {@link gridEventsEnum.DESTROYED} whether or not DOM was present. Middleware `pre` / `post` run for the `rendered: false` patch.
   * @group View
   */
  destroy(): void;

  /**
   * Snapshot merged {@link IOptions} — updates after {@link GameGrid.setOptions}.
   * @group Options
   */
  getOptions(): IOptions;

  /**
   * Cell at {@link IState.prevCoords}: matrix data (same source as {@link GameGrid.getCell}) plus mounted `current` / `coords` from refs when rendered.
   * @group Matrix
   */
  getPreviousCell(): ICell;

  /**
   * Cell at {@link IState.activeCoords}: matrix data (same source as {@link GameGrid.getCell}) plus mounted `current` / `coords` from refs when rendered.
   *
   * @remarks After {@link GameGrid.setCell}, `type` and other data fields match the matrix immediately. The painted node on `current` stays stale until {@link GameGrid.refreshCells} / {@link GameGrid.refresh}.
   * @group Matrix
   */
  getActiveCell(): ICell;

  /**
   * Move focus `(x,y)` when {@link IOptions.blockOnType}, {@link IOptions.collideOnType}, {@link IOptions.moveOnType}, and bounds/wrap rules allow.
   *
   * @remarks **Dispatch order (subset may apply):** {@link gridEventsEnum.MOVE_BLOCKED} if blocked; {@link gridEventsEnum.MOVE_COLLISION} when entering a collide-type cell; {@link gridEventsEnum.MOVE_DETTACH} when leaving a collide-type cell for a non-collide cell; {@link ICell.eventTypes} `onExit` then `onEnter` when the active cell changes; axis {@link gridEventsEnum.WRAP_X} / {@link gridEventsEnum.WRAP_Y} / {@link gridEventsEnum.BOUNDARY_X} / {@link gridEventsEnum.BOUNDARY_Y}; aggregate {@link gridEventsEnum.WRAP} / {@link gridEventsEnum.BOUNDARY}; finally {@link gridEventsEnum.MOVE_LAND} (pairs with the `onLand` member of {@link IOptions.callbacks}) only when the active cell actually changes. Move events carry {@link IMoveEventDetail} (`from`, `to`, `direction`, `blocked`). {@link GameGrid.render} does not call this method.
   * @group Movement
   */
  setActiveCell(x: number, y: number, direction?: string): void;

  /**
   * Accumulate every {@link ICell.type} matching `type` scanning row-major from {@link GameGrid.getMatrix}.
   * @group Matrix
   */
  getAllCellsByType(type: string): ICell[];

  /**
   * Logical matrix backing the grid (`matrix[row][column]` ⇒ `matrix[y][x]`).
   * @group Matrix
   */
  getMatrix(): ICell[][];

  /**
   * Replace logical matrix reference; callers must {@link GameGrid.refresh} or {@link GameGrid.render} to reconcile DOM when mounted.
   *
   * @remarks Headless grids also alias {@link IRefsObject.cells} to the new matrix so {@link GameGrid.getActiveCell} stays in sync.
   * @group Matrix
   */
  setMatrix(matrix: ICell[][]): void;

  /**
   * Logical cell from {@link GameGrid.getMatrix}: `matrix[coords[1]][coords[0]]` — raw matrix lookup (bounds unchecked).
   * @param coords - `[x, y]`.
   * @group Matrix
   */
  getCell(coords: readonly [number, number] | number[]): ICell;

  /**
   * Replace the logical cell at `coords` (`matrix[y][x]`). Does not render, refresh, or patch DOM/`refs`.
   *
   * @param coords - `[x, y]`.
   * @param cell - Stored by reference, same as {@link GameGrid.setMatrix}.
   * @remarks Bounds unchecked, matching {@link GameGrid.getCell}. Data-only: does not patch DOM, `refs`, or emit events. Movement / `blockOnType` read the new cell immediately. Call {@link GameGrid.refreshCells} with `{ coords }` (or `{ coords, cell }` instead of this method) to update mounted nodes; use {@link GameGrid.refresh} / {@link GameGrid.render} when the grid shape changes.
   * @group Matrix
   */
  setCell(coords: readonly [number, number] | number[], cell: ICell): void;

  /**
   * Shallow-merge behaviours into {@link IGameGrid.options} without swapping the matrix snapshot or re-rendering.
   * @group Options
   */
  setOptions(newOptions: IOptions): void;

  /**
   * Authoritative {@link IState} backing movement callbacks and renders.
   * @group State
   */
  getState(): IState;

  /**
   * Apply partial state with {@link MiddlewareFn} **`pre`** (mutate patch) → merge → **`post`**.
   *
   * @remarks Middleware runs around the merge inside this call; does not emit grid `CustomEvent`s.
   * @group State
   */
  setStateSync(obj: StatePatch): void;

  /**
   * Directional move: invokes the `onMove` member of {@link IOptions.callbacks} → dispatches {@link gridEventsEnum.MOVE_UP} (with {@link IMoveEventDetail}) → {@link GameGrid.setActiveCell}.
   * @group Movement
   */
  moveUp(): void;

  /**
   * @remarks Dispatches {@link gridEventsEnum.MOVE_RIGHT} (with {@link IMoveEventDetail}) before {@link GameGrid.setActiveCell}.
   * @group Movement
   */
  moveRight(): void;

  /**
   * @remarks Dispatches {@link gridEventsEnum.MOVE_DOWN} (with {@link IMoveEventDetail}) before {@link GameGrid.setActiveCell}.
   * @group Movement
   */
  moveDown(): void;

  /**
   * @remarks Dispatches {@link gridEventsEnum.MOVE_LEFT} (with {@link IMoveEventDetail}) before {@link GameGrid.setActiveCell}.
   * @group Movement
   */
  moveLeft(): void;

  /**
   * Walk to one cell, or along an explicit list of cells, through {@link GameGrid.setActiveCell}.
   *
   * @param coordsOrPath - A single `[x, y]` or an array of `[x, y]` steps. Not pathfinding (no A*): gaps teleport.
   * @remarks Each step uses the existing block / collide / wrap / zoom-edge rules. Stops when a step does not land on the requested cell (blocked, finite-edge clamp, or wrap to a different cell). Skips steps that are already the active cell. Not rate-limited by {@link IOptions.moveDebounce}. Does not dispatch directional {@link gridEventsEnum.MOVE_UP} / `MOVE_RIGHT` / `MOVE_DOWN` / `MOVE_LEFT` (same as a cell click).
   * @group Movement
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
   */
  rewind(steps?: number): void;

  /**
   * Jump to `index` in {@link IState.moves} (`0` = oldest remaining).
   *
   * @remarks No-op when `index` is not an integer in range, or it is already the current (last) entry.
   * Truncates history after the chosen index (later entries move to {@link IState.future}). Same events as {@link GameGrid.rewind}.
   * @group Movement
   */
  rewindTo(index: number): void;

  /**
   * Replay `steps` entries from {@link IState.future} (default `1`). Redo after {@link GameGrid.rewind}.
   *
   * @remarks No-op when the forward stack is empty, or `steps` is not a positive finite number.
   * Extra steps clamp to the newest remaining future entry. Not rate-limited by {@link IOptions.moveDebounce}.
   * Dispatches {@link gridEventsEnum.UNREWIND} (with `detail.steps` / `detail.index` plus {@link IMoveEventDetail}) then {@link gridEventsEnum.MOVE_LAND}.
   * @group Movement
   */
  unrewind(steps?: number): void;

  /**
   * Jump forward to `index` in the combined trail (`moves` then `future`).
   *
   * @remarks `index` is counted from the oldest remaining {@link IState.moves} entry (`0`), through the current cell, into {@link IState.future}.
   * No-op when `index` is not an integer strictly ahead of the current entry, or past the newest future coord.
   * Same events as {@link GameGrid.unrewind}.
   * @group Movement
   */
  unrewindTo(index: number): void;

  /**
   * Current zoom bounds or `null` when no zoom is active.
   * @group Zoom
   */
  getZoom(): IZoomBounds | null;

  /**
   * Apply a zoom window in world coordinates.
   *
   * @remarks Clamps `activeCoords` into bounds when outside. Dispatches {@link gridEventsEnum.ZOOM_SET}.
   * @group Zoom
   */
  setZoom(bounds: IZoomBounds, options?: IZoomOptions): void;

  /**
   * Clear the zoom window. Dispatches {@link gridEventsEnum.ZOOM_CLEARED}.
   * @group Zoom
   */
  clearZoom(options?: IZoomOptions): void;

  /**
   * Compute zoom bounds around a center cell ± radii, clipped to the matrix.
   * @group Zoom
   */
  getZoomAround(
    center: readonly [number, number] | number[],
    radiusX: number,
    radiusY?: number,
  ): IZoomBounds;

  /**
   * Compute zoom bounds for a quadrant (`divisions === 2`).
   * @group Zoom
   */
  getQuadrantZoom(quadrant: ZoomQuadrant): IZoomBounds;

  /**
   * Compute zoom bounds for a fraction tile (`divisions×divisions` grid).
   * @group Zoom
   */
  getFractionZoom(divisions: number, tileX: number, tileY: number): IZoomBounds;

  /**
   * Compute bounds then {@link GameGrid.setZoom}.
   * @group Zoom
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
   */
  zoomQuadrant(quadrant: ZoomQuadrant, options?: IZoomOptions): void;

  /**
   * Compute fraction bounds then {@link GameGrid.setZoom}.
   * @group Zoom
   */
  zoomFraction(divisions: number, tileX: number, tileY: number, options?: IZoomOptions): void;

  /**
   * Region tile for `coords`; `divisions` defaults to {@link IOptions.regionDivisions}.
   * @group Zoom
   */
  getRegionAt(coords: readonly [number, number] | number[], divisions?: number): IRegionTile;

  /**
   * {@link IState.region} or computed from the active cell when region tracking is enabled.
   * @group Zoom
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
 * @category Configuration
 */
export interface IOptions {
  id?: string;
  /**
   * Target for dispatched `CustomEvent`s carrying grid `detail`; defaults to `window` when available.
   * @remarks Use a standalone `EventTarget` (or `HTMLElement`) when hosting multiple grids.
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
  middlewares?: {
    /** Invoked synchronously **before** the patch merges into {@link IState} (see {@link MiddlewareFn}). */
    pre?: MiddlewareFn[];
    /** Invoked after merge; inspect merged state via {@link GameGrid.getState}. */
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
   */
  regionDivisions?: number;

  /** CSS transition duration (ms) for zoom slide. Default: `300`. */
  zoomSlideDuration?: number;

  /**
   * When `true` with {@link IOptions.regionDivisions}, {@link gridEventsEnum.ZOOM_EDGE} auto-zooms to the adjacent region tile.
   * Default: `false`.
   */
  slideZoomOnEdge?: boolean;

  /** Appended to `.gamegrid__viewport` whenever zoom is active. */
  zoomViewportClasses?: string[];

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
 * @example Two-step: {@link GameGrid.setCell} then paint
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
 * @category References
 */
export interface IRow extends IRef {
  index: number;
  cells: ICell[];
}

/**
 * Live references after {@link GameGrid.render}; `cells[y][x]` matches {@link GameGrid.getMatrix}.
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
