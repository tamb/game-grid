export interface ICell {
  renderFunction?: (cell: HTMLDivElement) => HTMLElement;
  cellAttributes?: string[][];
  type: string | string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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
