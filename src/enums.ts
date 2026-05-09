import type { IState } from './interfaces';

/**
 * String names of bubbling `CustomEvent`s emitted by {@link GameGrid}.
 *
 * @remarks
 * - Every dispatch funnels through the internal helper `fireGameGridEvent`; **`detail`** matches {@link IGameGridEventDetail} (always carries `gameGridInstance`).
 * - Prefer {@link IOptions.eventTarget} (or attach on a bubbled ancestor) when running multiple grids on one page.
 *
 * @category Events
 *
 * @example
 * ```ts
 * const target = gg.options.eventTarget ?? window;
 * target.addEventListener(gridEventsEnum.MOVE_LAND, (event: GameGridDOMEvent) => {
 *   const { gameGridInstance } = event.detail;
 *   console.log(gameGridInstance.getState());
 * });
 * ```
 */
export const gridEventsEnum = {
  /** Dispatched after {@link GameGrid.render} wires the container; `detail` follows {@link IGameGridEventDetail}. */
  RENDERED: 'gamegrid:grid:rendered',
  /** Dispatched at the end of construction (after optional initial {@link GameGrid.render}). */
  CREATED: 'gamegrid:grid:created',
  /** Dispatched from {@link GameGrid.destroy}; always fired even if the grid stayed headless or unmounted. */
  DESTROYED: 'gamegrid:grid:destroyed',

  /** `onMove` already ran; precedes {@link GameGrid.setActiveCell} for keyboard/pointer navigation. */
  MOVE_LEFT: 'gamegrid:move:left',
  MOVE_RIGHT: 'gamegrid:move:right',
  MOVE_UP: 'gamegrid:move:up',
  MOVE_DOWN: 'gamegrid:move:down',

  /** Target rejected by {@link IOptions.blockOnType} or {@link IOptions.moveOnType} allow-list; coords roll back. */
  MOVE_BLOCKED: 'gamegrid:move:blocked',
  /** Avatar entered an {@link IOptions.collideOnType} cell (movement may still succeed). */
  MOVE_COLLISION: 'gamegrid:move:collide',
  /** Avatar left a collide-type cell ({@link IOptions.collideOnType}) from the square it occupied before this move attempt. */
  MOVE_DETTACH: 'gamegrid:move:dettach',
  /** Finished resolving block/collide boundary/wrap choreography; mirrors the **onLand** callback in {@link IOptions.callbacks}. */
  MOVE_LAND: 'gamegrid:move:land',

  /** Aggregate finite-edge clamp fired after axis-specific {@link gridEventsEnum.BOUNDARY_X} / {@link gridEventsEnum.BOUNDARY_Y}. */
  BOUNDARY: 'gamegrid:move:boundary',
  /** X-axis requested outside row length while {@link IOptions.infiniteX} is falsy — coordinate clamped. */
  BOUNDARY_X: 'gamegrid:move:boundary:x',
  /** Y-axis requested outside matrix height while {@link IOptions.infiniteY} is falsy — coordinate clamped. */
  BOUNDARY_Y: 'gamegrid:move:boundary:y',

  /** Aggregate wrap fired after {@link gridEventsEnum.WRAP_X} / {@link gridEventsEnum.WRAP_Y} repositioning with {@link IOptions.infiniteX} / {@link IOptions.infiniteY} enabled. */
  WRAP: 'gamegrid:move:wrap',
  /** Horizontal infinite teleport to opposite edge (runs alongside **onWrapX** in {@link IOptions.callbacks}). */
  WRAP_X: 'gamegrid:move:wrap:x',
  /** Vertical infinite teleport (runs alongside **onWrapY** in {@link IOptions.callbacks}). */
  WRAP_Y: 'gamegrid:move:wrap:y',
};

/**
 * Built-in literal values for {@link ICell.type}, commonly referenced from {@link IOptions.blockOnType} arrays.
 *
 * @category Cells
 *
 * @example
 * ```ts
 * matrix[0][0] = { type: cellTypeEnum.OPEN };
 * ```
 */
export const cellTypeEnum = {
  OPEN: 'open',
  BARRIER: 'barrier',
  INTERACTIVE: 'interactive',
} as const;

/**
 * Canonical facing flags bound to directional CSS classes from {@link directionClassEnum}.
 *
 * @category Movement
 */
export enum directionEnum {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

/**
 * Applies to the rendered grid container to reflect the last move direction (`gamegrid__direction--*`).
 *
 * @category Presentation
 */
export const directionClassEnum: { [ket: string]: string } = {
  UP: 'gamegrid__direction--up',
  DOWN: 'gamegrid__direction--down',
  LEFT: 'gamegrid__direction--left',
  RIGHT: 'gamegrid__direction--right',
};

/** Default {@link IState} seeded before {@link IConfig.state} merges. Shipped as a named runtime export from the package barrel. */
export const INITIAL_STATE: IState = {
  activeCoords: [0, 0],
  prevCoords: [0, 0],
  rendered: false,
  moves: [],
  currentDirection: directionEnum.DOWN,
};

/**
 * BEM-aligned class hooks used when {@link GameGrid.render} builds the markup.
 *
 * @category Presentation
 */
export enum classesEnum {
  GRID = 'gamegrid',
  ROW = 'gamegrid__row',
  CELL = 'gamegrid__cell',
  ACTIVE_CELL = 'gamegrid__cell--active',
}

/**
 * Mirrors browser {@link https://developer.mozilla.org/docs/Web/API/KeyboardEvent/code | KeyboardEvent.code} payloads for WASD vs Arrow routing.
 *
 * @category Inputs
 *
 * @example
 * ```ts
 * gg.setOptions({ wasdControls: true });
 * ```
 */
export enum keycodeEnum {
  KeyDown = 'KeyS',
  KeyUp = 'KeyW',
  KeyLeft = 'KeyA',
  KeyRight = 'KeyD',
  ArrowDown = 'ArrowDown',
  ArrowUp = 'ArrowUp',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
}
