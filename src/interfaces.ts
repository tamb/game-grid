export interface ICell {
  renderFunction?: (gamegridInstance: IGameGrid) => HTMLElement;
  cellAttributes?: string[][];
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
export interface IState {
  active_coords: number[];
  prev_coords: number[];
  next_coords: number[];
  moves: number[][];
  current_direction?: string;
  rendered?: boolean;
}
export interface IOptions {
  arrow_controls?: boolean;
  wasd_controls?: boolean;
  infinite_x?: boolean;
  infinite_y?: boolean;
  clickable?: boolean;
  rewind_limit?: number;
  middlewares?: {
    pre: ((gamegridInstance: IGameGrid, newState: any) => void)[];
    post: ((gamegridInstance: IGameGrid, newState: any) => void)[];
  };

  // TODO: Utilize these options to add additional supported cell types
  block_on_type?: string[];
  collide_on_type?: string[];
  move_on_type?: string[];

  // TODO: Add support for this
  // render options
  active_class?: string;
  container_class?: string;
  row_class?: string;
}

export interface IConfig {
  options?: IOptions;
  matrix: ICell[][];
  state?: IState;
}

export interface IRefs {
  container: HTMLElement | null;
  rows: HTMLDivElement[];
  cells: HTMLDivElement[][];
}

export interface IGameGrid {
  refs: IRefs;
  renderGrid: (container: HTMLElement) => void;
  getOptions: () => IOptions;
  setOptions: (newOptions: IOptions) => void;
  destroy: () => void;
  getState: () => IState;
  moveLeft: () => void;
  moveUp: () => void;
  moveRight: () => void;
  moveDown: () => void;
  setMatrix: (m: ICell[][]) => void;
  getMatrix: () => ICell[][];
  setStateSync: (obj: IState) => void;
  getActiveCell: () => HTMLDivElement;
}
