/** `activeCoords`, `prevCoords`, and cell `coords` use `[x, y]` → column, then row (`matrix[row][col]` → `matrix[y][x]`). */
export interface IState {
  /** Current focus column `x`, then row `y`. Same order as {@link GameGrid.setActiveCell}. */
  activeCoords: number[];
  /** Last position before `activeCoords` updated. */
  prevCoords: number[];
  /** History of `[x,y]` coords; length capped by {@link IOptions.rewindLimit}. */
  moves: number[][];
  /** `true` after {@link GameGrid.render}. */
  rendered?: boolean;
  /** Last cardinal direction string (`directionEnum.UP`, `directionEnum.DOWN`, ...). */
  currentDirection?: string;
}

/**
 * Accepted shape for {@link GameGrid.setStateSync}. Base fields mirror {@link IState};
 * you may attach extra serialisable keys via the index signature.
 *
 * @example
 * ```ts
 * grid.setStateSync({ activeCoords: [1, 2], myMeta: true });
 * ```
 */
export type StatePatch = Partial<IState> & Record<string, unknown>;

/**
 * `CustomEvent.detail` for every bubbling grid DOM event constructed by the internal `fireGameGridEvent` helper used in {@link GameGrid}.
 *
 * @remarks All built-in emits pass only `gameGridInstance`; the index signature reserves space for callers who forward extra fields via that helper's `data` argument.
 *
 * @category Events
 */
export interface IGameGridEventDetail extends Record<string, unknown> {
  /** The emitting grid (`this` inside {@link GameGrid}). */
  gameGridInstance: IGameGrid;
}

/**
 * Narrow type for listeners bound to {@link gridEventsEnum} strings.
 *
 * @category Events
 */
export type GameGridDOMEvent = CustomEvent<IGameGridEventDetail>;

/** Allowed fields when merging initial grid {@link GameGrid} state. */
export interface IDefaultState {
  activeCoords?: number[];
  prevCoords?: number[];
  currentDirection?: string;
  moves?: number[][];
  rendered?: boolean;
}

/**
 * Public contract implemented by {@link GameGrid}.
 *
 * @remarks For DOM events emitted by the grid (`CustomEvent`s), see {@link IGameGridEventDetail} and {@link gridEventsEnum}.
 *
 * @category Grid contract
 */
export interface IGameGrid {
  /** After {@link GameGrid.render}, hydrated rows/cells and `container`. Headless grids mirror `cells` onto the logical matrix until mount. */
  refs: IRefsObject;
  /** Runtime toggles: input, collisions, middleware, callbacks, styling. Merged from ctor defaults and {@link GameGrid.setOptions}. */
  options: IOptions;

  /**
   * Mount markup into `container`, wire keyboard/pointer handlers, activate initial cell.
   *
   * @remarks Clears/rebuilds refs for this mount. Prefer {@link GameGrid.refresh} after the first paint when rebuilding from the same host. Dispatches {@link gridEventsEnum.RENDERED} once the container is patched and listeners attach.
   */
  render(container: HTMLElement): void;

  /**
   * Tear down handlers, wipe `container`, rebuild rows/cells from {@link GameGrid.getMatrix}, reattach handlers.
   *
   * @throws When {@link IRefsObject.container} is missing (never rendered successfully).
   * @remarks Does not dispatch {@link gridEventsEnum.RENDERED}; that event is emitted from {@link GameGrid.render}.
   */
  refresh(): void;

  /**
   * Detach listeners when rendered and clear injected structure; resets `rendered` in state.
   *
   * @remarks Idempotent-friendly: always dispatches {@link gridEventsEnum.DESTROYED} whether or not DOM was present.
   */
  destroy(): void;

  /** Snapshot merged {@link IOptions} — updates after {@link GameGrid.setOptions}. */
  getOptions(): IOptions;

  /** Shallow-cloned cell snapshot for {@link IState.prevCoords}: `refs.cells[prevCoords[1]][prevCoords[0]]` after {@link GameGrid.render}. */
  getPreviousCell(): ICell;

  /** Hydrated cell at {@link IState.activeCoords} (`refs.cells[y][x]`); refs must cover those indices after render. */
  getActiveCell(): ICell;

  /**
   * Move focus `(x,y)` when {@link IOptions.blockOnType}, {@link IOptions.collideOnType}, {@link IOptions.moveOnType}, and bounds/wrap rules allow.
   *
   * @remarks **Dispatch order (subset may apply):** {@link gridEventsEnum.MOVE_BLOCKED} if blocked; {@link gridEventsEnum.MOVE_COLLISION} / {@link gridEventsEnum.MOVE_DETTACH} for collide enter/exit; axis {@link gridEventsEnum.WRAP_X} / {@link gridEventsEnum.WRAP_Y} / {@link gridEventsEnum.BOUNDARY_X} / {@link gridEventsEnum.BOUNDARY_Y}; aggregate {@link gridEventsEnum.WRAP} / {@link gridEventsEnum.BOUNDARY}; finally {@link gridEventsEnum.MOVE_LAND} (pairs with the `onLand` member of {@link IOptions.callbacks}).
   */
  setActiveCell(x: number, y: number, direction?: string): void;

  /**
   * Accumulate every {@link ICell.type} matching `type` scanning row-major from {@link GameGrid.getMatrix}.
   */
  getAllCellsByType(type: string): ICell[];

  /** Logical matrix backing the grid (`matrix[row][column]` ⇒ `matrix[y][x]`). */
  getMatrix(): ICell[][];

  /** Replace logical matrix reference; callers must {@link GameGrid.refresh} or {@link GameGrid.render} to reconcile DOM when mounted. */
  setMatrix(matrix: ICell[][]): void;

  /**
   * Logical cell from {@link GameGrid.getMatrix}: `matrix[coords[1]][coords[0]]` — raw matrix lookup (bounds unchecked).
   * @param coords - `[x, y]`.
   */
  getCell(coords: readonly [number, number] | number[]): ICell;

  /** Shallow-merge behaviours into {@link IGameGrid.options} without swapping the matrix snapshot. */
  setOptions(newOptions: IOptions): void;

  /** Authoritative {@link IState} backing movement callbacks and renders. */
  getState(): IState;

  /**
   * Apply partial state with {@link MiddlewareFn} **`pre`** (mutate patch) → merge → **`post`**.
   *
   * @remarks Middleware runs around the merge inside this call; does not emit grid `CustomEvent`s.
   */
  setStateSync(obj: StatePatch): void;

  /**
   * Directional move: invokes the `onMove` member of {@link IOptions.callbacks} → dispatches {@link gridEventsEnum.MOVE_UP} → {@link GameGrid.setActiveCell}.
   */
  moveUp(): void;

  /**
   * @remarks Dispatches {@link gridEventsEnum.MOVE_RIGHT} before {@link GameGrid.setActiveCell}.
   */
  moveRight(): void;

  /**
   * @remarks Dispatches {@link gridEventsEnum.MOVE_DOWN} before {@link GameGrid.setActiveCell}.
   */
  moveDown(): void;

  /**
   * @remarks Dispatches {@link gridEventsEnum.MOVE_LEFT} before {@link GameGrid.setActiveCell}.
   */
  moveLeft(): void;
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
  infiniteX?: boolean;
  infiniteY?: boolean;
  clickable?: boolean;
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
  };

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
  eventTypes?: {
    onEnter: string;
    onExit: string;
  };
  coords?: number[];
}

/** Describes a rendered row plus associated {@link ICell} metadata. */
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

/** @deprecated Use {@link IRefsObject}; identical alias retained for transitional typings. */
export type IRefs = IRefsObject;
