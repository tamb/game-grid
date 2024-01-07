export interface ICell {
    type: string;
    renderFunction?: (gamegridInstance: IGameGrid) => HTMLElement;
    cellAttributes?: string[][];
    eventTypes?: {
        onEnter: string;
        onExit: string;
    };
    [key: string]: any;
}
export interface IState {
    activeCoords: number[];
    prevCoords: number[];
    nextCoords: number[];
    moves: number[][];
    currentDirection?: string;
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
        pre: ((gamegridInstance: IGameGrid, newState: any) => void)[];
        post: ((gamegridInstance: IGameGrid, newState: any) => void)[];
    };
    blockOnType?: string[];
    collideOnType?: string[];
    moveOnType?: string[];
    activeClass?: string;
    containerClass?: string;
    rowClass?: string;
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
