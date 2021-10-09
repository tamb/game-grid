export interface ICell {
  renderFunction?: (cell: HTMLDivElement) => HTMLElement;
  cellAttributes?: string[][];
  type: string | string[];
}
export interface IState {
  active_coords?: number[];
  prev_coords?: number[];
  next_coords?: number[];
  moves?: number[][];
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

  // TODO: Utilize these options to add additional supported cell types
  block_on_type?: string[];
  interact_on_type?: string[];
  move_on_type?: string[];

  // TODO: Add support for this
  // render options
  active_class?: string;
  container_class?: string;
  row_class?: string;
  callbacks?: ICallbacks;
}

interface ICallbacks {
  STATE_UPDATED?: Function;
  MOVE_LEFT?: Function;
  MOVE_RIGHT?: Function;
  MOVE_UP?: Function;
  MOVE_DOWN?: Function;
  MOVE_BLOCKED?: Function;
  MOVE_COLLISION?: Function;
  MOVE_DETTACH?: Function;
  MOVE_LAND?: Function;
  LIMIT?: Function;
  LIMIT_X?: Function;
  LIMIT_Y?: Function;
  WRAP?: Function;
  WRAP_X?: Function;
  WRAP_Y?: Function;
}

export interface IConfig {
  options?: IOptions;
  matrix: ICell[][];
  state?: IState;
}

export interface IRefs {
  container: HTMLElement;
  rows?: HTMLDivElement[];
  cells?: HTMLDivElement[][];
}
