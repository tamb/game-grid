export interface IState {
  activeCoords: number[];
  prevCoords: number[];
  moves: number[][];
  rendered?: boolean;
  currentDirection?: string;
  [key: string]: any;
}

export interface IDefaultState {
  activeCoords?: number[];
  prevCoords?: number[];
  currentDirection?: string;
  moves?: number[][];
  rendered?: boolean;
}
export interface IOptions {
  id?: string;
  arrowControls?: boolean;
  wasdControls?: boolean;
  infiniteX?: boolean;
  infiniteY?: boolean;
  clickable?: boolean;
  rewindLimit?: number;
  middlewares?: {
    pre?: ((gamegridInstance: IGameGrid, newState: any) => void)[];
    post?: ((gamegridInstance: IGameGrid, newState: any) => void)[];
  };
  callbacks?: {
    onMove?: (gamegridInstance: IGameGrid, newState: any) => void;
    onLand?: (gamegridInstance: IGameGrid, newState: any) => void;
    onBlock?: (gamegridInstance: IGameGrid, newState: any) => void;
    onCollide?: (gamegridInstance: IGameGrid, newState: any) => void;
    onDettach?: (gamegridInstance: IGameGrid, newState: any) => void;
    onBoundary?: (gamegridInstance: IGameGrid, newState: any) => void;
    onBoundaryX?: (gamegridInstance: IGameGrid, newState: any) => void;
    onBoundaryY?: (gamegridInstance: IGameGrid, newState: any) => void;
    onWrap?: (gamegridInstance: IGameGrid, newState: any) => void;
    onWrapX?: (gamegridInstance: IGameGrid, newState: any) => void;
    onWrapY?: (gamegridInstance: IGameGrid, newState: any) => void;
  };

  // TODO: Utilize these options to add additional supported cell types
  blockOnType?: string[];
  collideOnType?: string[];
  moveOnType?: string[];

  // TODO: Add support for this
  // render options
  activeClasses?: string[];
  cellClasses?: string[];
  containerClasses?: string[];
  rowClasses?: string[];
}

export interface IConfig {
  options?: IOptions;
  matrix: ICell[][];
  state?: IDefaultState | IState;
}

export interface IRef {
  current?: HTMLDivElement | null;
}

interface ICellContext {
  coords: number[];
  cell: ICell;
  gamegrid: IGameGrid;
}

export interface ICell extends IRef {
  type: string;
  render?: (context: ICellContext) => HTMLElement;
  cellAttributes?: string[][];
  eventTypes?: {
    onEnter: string;
    onExit: string;
  };
  coords?: number[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface IRow extends IRef {
  index: number;
  cells: ICell[];
}

export interface IRefsObject {
  container: HTMLElement | null;
  rows: IRow[];
  cells: ICell[][];
}

export interface IGameGrid {
  refs: IRefsObject;
  options: IOptions;

  render(container: HTMLElement): void;
  refresh(): void; //TODO: Add support for this
  destroy(): void;
  create(): void;
  getOptions(): IOptions;
  getPreviousCell(): ICell;
  getActiveCell(): ICell;
  setActiveCell(x: number, y: number, direction?: string): void;
  getAllCellsByType(type: string): ICell[];
  getMatrix(): ICell[][];
  setMatrix(matrix: ICell[][]): void;
  getCell(coords: number[]): ICell;
  setOptions(newOptions: IOptions): void;
  getState(): IState;
  setStateSync(obj: IState | any): void;
  moveUp(): void;
  moveRight(): void;
  moveDown(): void;
  moveLeft(): void;
}
