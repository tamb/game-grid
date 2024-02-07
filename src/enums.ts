import { IState } from './interfaces';

export const gridEventsEnum = {
  RENDERED: 'gamegrid:grid:rendered',
  CREATED: 'gamegrid:grid:created',
  DESTROYED: 'gamegrid:grid:destroyed',

  MOVE_LEFT: 'gamegrid:move:left',
  MOVE_RIGHT: 'gamegrid:move:right',
  MOVE_UP: 'gamegrid:move:up',
  MOVE_DOWN: 'gamegrid:move:down',

  MOVE_BLOCKED: 'gamegrid:move:blocked', // hits a wall
  MOVE_COLLISION: 'gamegrid:move:collide', // overlaps another entity
  MOVE_DETTACH: 'gamegrid:move:dettach', // leaves overlapping an entity
  MOVE_LAND: 'gamegrid:move:land', // move finished

  BOUNDARY: 'gamegrid:move:boundary',
  BOUNDARY_X: 'gamegrid:move:boundary:x',
  BOUNDARY_Y: 'gamegrid:move:boundary:y',

  WRAP: 'gamegrid:move:wrap',
  WRAP_X: 'gamegrid:move:wrap:x',
  WRAP_Y: 'gamegrid:move:wrap:y',
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
  OPEN: 'open',
  BARRIER: 'barrier',
  INTERACTIVE: 'interactive',
};

export enum directionEnum {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export const directionClassEnum: { [ket: string]: string } = {
  UP: 'gamegrid__direction--up',
  DOWN: 'gamegrid__direction--down',
  LEFT: 'gamegrid__direction--left',
  RIGHT: 'gamegrid__direction--right',
};

export const INITIAL_STATE: IState = {
  activeCoords: [0, 0],
  prevCoords: [0, 0],
  rendered: false,
  moves: [],
  currentDirection: directionEnum.DOWN,
};

export enum classesEnum {
  GRID = 'gamegrid',
  ROW = 'gamegrid__row',
  CELL = 'gamegrid__cell',
  ACTIVE_CELL = 'gamegrid__cell--active',
}

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
