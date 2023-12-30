import { IState } from './interfaces';
export declare const gridEventsEnum: {
    RENDERED: string;
    CREATED: string;
    DESTROYED: string;
    MOVE_LEFT: string;
    MOVE_RIGHT: string;
    MOVE_UP: string;
    MOVE_DOWN: string;
    MOVE_BLOCKED: string;
    MOVE_COLLISION: string;
    MOVE_DETTACH: string;
    MOVE_LAND: string;
    LIMIT: string;
    LIMIT_X: string;
    LIMIT_Y: string;
    WRAP: string;
    WRAP_X: string;
    WRAP_Y: string;
};
/**
 * Taxonomy:
 * You get BLOCKED by Barriers
 * You COLLIDE with Interactive cells
 * You DETTACH from Interactive cells
 * You LAND on an open cell
 *
 */
export declare const cellTypeEnum: {
    OPEN: string;
    BARRIER: string;
    INTERACTIVE: string;
};
export declare const INITIAL_STATE: IState;
export declare const DIRECTIONS: {
    UP: string;
    DOWN: string;
    LEFT: string;
    RIGHT: string;
};
