export default class HtmlGameGrid {
    private options;
    private matrix;
    private refs;
    private state;
    constructor(query: string, config: IConfig);
    getOptions(): IOptions;
    setOptions(newOptions: IOptions): void;
    getRefs(): IRefs;
    destroy(): void;
    getState(): IState;
    moveLeft(): void;
    moveUp(): void;
    moveRight(): void;
    moveDown(): void;
    setMatrix(m: ICell[][]): void;
    getMatrix(): ICell[][];
    setStateSync(obj: IState): void;
    render(): void;
    private setFocusToCell;
    getActiveCell(): HTMLDivElement;
    init(): void;
    private removeActiveClasses;
    private addToMoves;
    private testLimit;
    private testInteractive;
    private testBarrier;
    private testSpace;
    private finishMove;
    private handleDirection;
    private handleKeyDown;
    private handleCellClick;
    private containerFocus;
    private containerBlur;
    private attachHandlers;
    private dettachHandlers;
}

export declare function renderAttributes(el: HTMLElement, tuples: any): void;
export declare function getCoordsFromElement(el: HTMLElement): number[];
export declare function fireCustomEvent(eventName: string, data: any): void;
export declare function mapRowColIndicesToXY(rI: number, cI: number): number[];
export declare function mapXYToRowColIndices(x: number, y: number): number[];

export interface ICell {
    renderFunction?: (cell: HTMLDivElement) => HTMLElement;
    cellAttributes?: string[][];
    type: string | string[];
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
    block_on_type?: string[];
    collide_on_type?: string[];
    move_on_type?: string[];
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
