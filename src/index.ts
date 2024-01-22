import { fireCustomEvent, renderAttributes, insertStyles } from './utils';
import {
  directionsEnum,
  INITIAL_STATE,
  cellTypeEnum,
  gridEventsEnum,
  elementsEnum,
  classesEnum,
  keycodeEnum,
} from './enums';
import {
  IState,
  IOptions,
  ICell,
  IRefsObject,
  IConfig,
  IGameGrid,
} from './interfaces';

export default class GameGrid implements IGameGrid {
  public options: IOptions;
  private matrix: ICell[][];
  private state: IState = INITIAL_STATE;
  public refs: IRefsObject;
  public root?: HTMLElement;

  constructor(config: IConfig, container?: HTMLElement) {
    this.root = container;
    this.options = {
      activeClass: classesEnum.ACTIVE_CELL,
      arrowControls: true,
      wasdControls: true,
      infiniteX: true,
      infiniteY: true,
      clickable: true,
      rewindLimit: 20,
      blockOnType: [cellTypeEnum.BARRIER],
      collideOnType: [cellTypeEnum.INTERACTIVE],
      moveOnType: [cellTypeEnum.OPEN],
      // overrides
      ...config.options,
    };

    this.refs = this.setEmptyRefs();

    this.matrix = config.matrix;
    this.state = {
      ...INITIAL_STATE,
      ...config.state,
    };

    if (container) {
      this.render(container);
    } else {
      this.refs.cells = this.matrix;
      this.setStateSync({ rendered: false });
    }
    fireCustomEvent.call(this, gridEventsEnum.CREATED);
  }

  // STATE
  private updateState(obj: any): void {
    const newState: IState = { ...this.state, ...obj };
    this.state = newState;
  }
  public setStateSync(obj: any): void {
    if (this.options.middlewares) {
      this.options.middlewares.pre?.forEach(
        (fn: (gamegridInstance: IGameGrid, newState: any) => void) => {
          fn(this, obj);
        },
      );
      this.updateState(obj);
      this.options.middlewares.post?.forEach(
        (fn: (gamegridInstance: IGameGrid, newState: any) => void) => {
          fn(this, obj);
        },
      );
    } else {
      this.updateState(obj);
    }
  }
  public getState(): IState {
    return this.state;
  }

  // DOM MANIPULATION

  private setEmptyRefs(): IRefsObject {
    return {
      container: null,
      rows: [],
      cells: [],
    };
  }

  public refresh() {
    throw new Error('Method not implemented.');
  }

  public render(container: HTMLElement): void {
    insertStyles();
    const fragment = this.renderGrid();
    container.appendChild(fragment);
    this.setStateSync({ rendered: true });
    fireCustomEvent.call(this, gridEventsEnum.RENDERED);
    this.attachHandlers();
    this.setActiveCell(
      this.state.activeCoords![0],
      this.state.activeCoords![1],
    );
  }

  private renderGrid(): DocumentFragment {
    this.augmentContainer(this.root!);
    const fragment = document.createDocumentFragment();

    this.matrix.forEach((rowData: ICell[], rI: number) => {
      const row: HTMLDivElement = this.renderRow(rI);
      this.refs.cells.push([]);

      rowData.forEach((cellData: ICell, cI: number) => {
        const cell: HTMLDivElement = this.renderCell(rI, cI, cellData);
        row.appendChild(cell);
        this.refs.cells[rI].push({
          ...cellData,
          current: cell,
          coords: [cI, rI],
        });
      });
      this.refs.rows.push({
        index: rI,
        ...rowData,
        current: row,
        cells: this.refs.cells[rI],
      });
      fragment.appendChild(row);
    });

    return fragment;
  }

  private augmentContainer(container: HTMLElement): void {
    this.refs.container = container;
    container.classList.add(classesEnum.GRID);
    container.setAttribute('tabindex', '0');
    container.setAttribute('data-gamegrid-ref', 'container');
  }

  private renderRow(rI: number): HTMLDivElement {
    const row: HTMLDivElement = document.createElement(elementsEnum.ROW);
    this.options.rowClass ? row.classList.add(this.options.rowClass) : null;
    row.setAttribute('data-gamegrid-row-index', rI.toString());
    row.setAttribute('data-gamegrid-ref', 'row');
    row.classList.add(classesEnum.ROW);
    return row;
  }

  private renderCell(rI: number, cI: number, cellData: ICell): HTMLDivElement {
    const cell: HTMLDivElement = document.createElement(elementsEnum.CELL);
    renderAttributes(cell, [
      ['data-gamegrid-ref', 'cell'],
      ['data-gamegrid-coords', `${cI},${rI}`],
      ['data-gamegrid-cell-type', cellData.type || cellTypeEnum.OPEN],
    ]);

    cell.style.width = `${100 / this.matrix[rI].length}%`;
    cellData.cellAttributes?.forEach((attr: string[]) => {
      cell.setAttribute(attr[0], attr[1]);
    });

    cell.classList.add(classesEnum.CELL);

    if (cellData.render) {
      cell.appendChild(
        cellData.render({
          coords: [rI, cI],
          cell: cellData,
          gamegrid: this,
        }),
      );
    }
    return cell;
  }

  public setActiveCell(col: number, row: number): void {
    const cells = this.refs.cells;
    if (!cells) {
      throw new Error('No cells found');
    }
    this.removeActiveClasses();
    cells[row][col].current?.classList.add(classesEnum.ACTIVE_CELL);
    this.setStateSync({ activeCoords: [col, row] });
  }

  private removeActiveClasses(): void {
    this.refs.cells.forEach((cellRow) => {
      cellRow.forEach((cell: ICell) => {
        cell.current?.classList.remove(classesEnum.ACTIVE_CELL);
      });
    });
  }

  private containerBlur = (): void => {
    this.options.activeClass
      ? this.refs.container!.classList.remove(this.options.activeClass)
      : null;
  };

  public getActiveCell(): ICell {
    return this.refs.cells[this.state.activeCoords![1]][
      this.state.activeCoords![0]
    ];
  }

  public getPreviousCell(): ICell {
    return {
      ...this.matrix[this.state.prevCoords![0]][this.state.prevCoords![1]],
    };
  }

  public getCell(coords: number[]): ICell {
    return this.matrix[coords[0]][coords[1]];
  }

  public getAllCellsByType(type: string): ICell[] {
    const cells: ICell[] = [];
    this.matrix.forEach((row: ICell[], rI: number) => {
      row.forEach((cell: ICell, cI: number) => {
        if (cell.type === type) {
          cells.push(this.getCell([cI, rI]));
        }
      });
    });
    return cells;
  }

  // MOVEMENT
  /// DIRECTIONS
  public moveUp(): void {
    this.options.callbacks?.onMove?.(this, this.getState());
    this.setStateSync({
      nextCoords: [
        this.state.activeCoords![0],
        this.state.activeCoords![1] - 1,
      ],
      currentDirection: directionsEnum.UP,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_UP);
    this.finishMove();
  }

  public moveRight(): void {
    this.options.callbacks?.onMove?.(this, this.getState());
    this.setStateSync({
      nextCoords: [
        this.state.activeCoords![0] + 1,
        this.state.activeCoords![1],
      ],
      currentDirection: directionsEnum.RIGHT,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_RIGHT);
    this.finishMove();
  }

  public moveDown(): void {
    this.options.callbacks?.onMove?.(this, this.getState());
    this.setStateSync({
      nextCoords: [
        this.state.activeCoords![0],
        this.state.activeCoords![1] + 1,
      ],
      currentDirection: directionsEnum.DOWN,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_DOWN);
    this.finishMove();
  }

  public moveLeft(): void {
    this.options.callbacks?.onMove?.(this, this.getState());
    this.setStateSync({
      nextCoords: [
        this.state.activeCoords![0] - 1,
        this.state.activeCoords![1],
      ],
      currentDirection: directionsEnum.LEFT,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_LEFT);
    this.finishMove();
  }

  /// MOVEMENT HELPERS
  private addToMoves(): void {
    const clonedMoves = [...this.getState().moves];
    clonedMoves.unshift(this.state.activeCoords);
    if (clonedMoves.length > this.options.rewindLimit!) {
      clonedMoves.shift();
    }
    this.setStateSync({ moves: clonedMoves });
  }

  private testLimit(): void {
    // use state direction, and state active coords
    let nextX: number = this.state.nextCoords![0];
    let nextY: number = this.state.nextCoords![1];

    const yLimit: number = this.matrix.length - 1;
    const xLimit: number = this.matrix[this.state.activeCoords[1]].length - 1;

    switch (this.state.currentDirection) {
      case directionsEnum.UP:
        if (nextY < 0) {
          if (this.options.infiniteY) {
            nextY = yLimit;
            fireCustomEvent.call(this, gridEventsEnum.WRAP_Y);
            fireCustomEvent.call(this, gridEventsEnum.WRAP);
            this.options.callbacks?.onWrap?.(this, this.getState());
          } else {
            nextY = 0;
            fireCustomEvent.call(this, gridEventsEnum.BOUNDARY_Y);
            fireCustomEvent.call(this, gridEventsEnum.BOUNDARY);
            this.options.callbacks?.onBoundary?.(this, this.getState());
          }
        }
        break;
      case directionsEnum.RIGHT:
        if (nextX > xLimit) {
          if (!this.options.infiniteX) {
            nextX = xLimit;
            fireCustomEvent.call(this, gridEventsEnum.BOUNDARY_X);
            fireCustomEvent.call(this, gridEventsEnum.BOUNDARY);
            this.options.callbacks?.onBoundary?.(this, this.getState());
          } else {
            nextX = 0;
            fireCustomEvent.call(this, gridEventsEnum.WRAP_X);
            fireCustomEvent.call(this, gridEventsEnum.WRAP);
            this.options.callbacks?.onWrap?.(this, this.getState());
          }
        }
        break;
      case directionsEnum.DOWN:
        if (nextY > yLimit) {
          if (!this.options.infiniteY) {
            nextY = yLimit;
            fireCustomEvent.call(this, gridEventsEnum.BOUNDARY_Y);
            fireCustomEvent.call(this, gridEventsEnum.BOUNDARY);
            this.options.callbacks?.onBoundary?.(this, this.getState());
          } else {
            nextY = 0;
            fireCustomEvent.call(this, gridEventsEnum.WRAP_Y);
            fireCustomEvent.call(this, gridEventsEnum.WRAP);
            this.options.callbacks?.onWrap?.(this, this.getState());
          }
        }
        break;
      case directionsEnum.LEFT:
        if (nextX < 0) {
          if (this.options.infiniteX) {
            nextX = xLimit;
            fireCustomEvent.call(this, gridEventsEnum.WRAP_X);
            fireCustomEvent.call(this, gridEventsEnum.WRAP);
            this.options.callbacks?.onWrap?.(this, this.getState());
          } else {
            nextX = 0;
            fireCustomEvent.call(this, gridEventsEnum.BOUNDARY_X);
            fireCustomEvent.call(this, gridEventsEnum.BOUNDARY);
            this.options.callbacks?.onBoundary?.(this, this.getState());
          }
        }
        break;
    }

    this.setStateSync({
      nextCoords: [nextX, nextY],
      activeCoords: [nextX, nextY],
      prevCoords: this.state.activeCoords,
    });
  }

  private testInteractive(): void {
    const coords = this.state.nextCoords;
    if (this.matrix[coords[1]][coords[0]]?.type === cellTypeEnum.INTERACTIVE) {
      fireCustomEvent.call(this, gridEventsEnum.MOVE_COLLISION);
      this.options.callbacks?.onCollide?.(this, this.getState());
    }
  }

  private testBarrier(): void {
    const coords = this.state.nextCoords;
    if (this.matrix[coords[1]][coords[0]]?.type === cellTypeEnum.BARRIER) {
      this.setStateSync({
        activeCoords: this.state.prevCoords,
        prevCoords: this.state.activeCoords,
      });
      fireCustomEvent.call(this, gridEventsEnum.MOVE_BLOCKED);
      this.options.callbacks?.onBlock?.(this, this.getState());
    }
  }

  private testSpace(): void {
    const coords = this.state.nextCoords;
    if (this.matrix[coords[1]][coords[0]]?.type === cellTypeEnum.OPEN) {
      const prevCoords = this.state.prevCoords;
      if (
        this.matrix[prevCoords[1]][prevCoords[0]].type ===
        cellTypeEnum.INTERACTIVE
      ) {
        fireCustomEvent.call(this, gridEventsEnum.MOVE_DETTACH);
        this.options.callbacks?.onDettach?.(this, this.getState());
      }
    }
  }

  private finishMove(): void {
    this.testLimit();
    this.testSpace();
    this.testInteractive();
    this.testBarrier();
    this.state.rendered
      ? this.setActiveCell(
          this.state.activeCoords[0],
          this.state.activeCoords[1],
        )
      : null;
    this.addToMoves();
    fireCustomEvent.call(this, gridEventsEnum.MOVE_LAND);
    this.options.callbacks?.onLand?.(this, this.getState());
  }

  // EVENT HANDLERS
  private handleDirection(event: KeyboardEvent): void {
    switch (event.code) {
      case keycodeEnum.ArrowLeft: {
        //left
        this.moveLeft();
        break;
      }
      case keycodeEnum.KeyLeft: {
        //left
        this.moveLeft();
        break;
      }
      case keycodeEnum.ArrowUp: {
        //up
        this.moveUp();
        break;
      }
      case keycodeEnum.KeyUp: {
        //up
        this.moveUp();
        break;
      }
      case keycodeEnum.ArrowRight: {
        //right
        this.moveRight();
        break;
      }
      case keycodeEnum.KeyRight: {
        //right
        this.moveRight();
        break;
      }
      case keycodeEnum.ArrowDown: {
        //down
        this.moveDown();
        break;
      }
      case keycodeEnum.KeyDown: {
        //down
        this.moveDown();
        break;
      }
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.options.arrowControls) {
      if (
        event.code === keycodeEnum.ArrowUp ||
        event.code === keycodeEnum.ArrowRight ||
        event.code === keycodeEnum.ArrowDown ||
        event.code === keycodeEnum.ArrowLeft
      ) {
        event.preventDefault();
        this.handleDirection(event);
      }
    }
    if (this.options.wasdControls) {
      if (
        event.code === keycodeEnum.KeyUp ||
        event.code === keycodeEnum.KeyRight ||
        event.code === keycodeEnum.KeyDown ||
        event.code === keycodeEnum.KeyLeft
      ) {
        event.preventDefault();
        this.handleDirection(event);
      }
    }
  };

  private handleCellClick = (event: MouseEvent): void => {
    try {
      if (this.getOptions().clickable) {
        if (event.target instanceof HTMLElement) {
          const cellEl: HTMLElement = event.target.closest(
            '[data-gamegrid-ref="cell"]',
          )!;
          if (cellEl) {
            const coords: number[] = cellEl
              .getAttribute('data-gamegrid-coords')!
              .split(',')
              .map((n) => Number(n));
            this.setStateSync({
              nextCoords: coords,
            });

            this.setActiveCell(
              this.state.nextCoords![0],
              this.state.nextCoords![1],
            );
          } else {
            throw new Error('No cell found');
          }
        }
      }
    } catch (e) {
      console.error(e);
      throw new Error(
        'Error handling cell click. You possibly have missing attributes',
      );
    }
  };

  // SET UP AND TEAR DOWN
  public getOptions(): IOptions {
    return this.options;
  }
  public setOptions(newOptions: IOptions): void {
    this.options = { ...this.options, ...newOptions };
  }
  public destroy(): void {
    this.state.rendered ? this.dettachHandlers() : null;
  }

  public setMatrix(m: ICell[][]): void {
    this.matrix = m;
  }

  public getMatrix(): ICell[][] {
    return this.matrix;
  }

  private attachHandlers(): void {
    const container = this.refs.container;
    if (container) {
      container.addEventListener('keydown', this.handleKeyDown);
      container.addEventListener('blur', this.containerBlur);
      container.addEventListener('click', this.handleCellClick);
    }
  }

  private dettachHandlers(): void {
    const container = this.refs.container;
    if (container) {
      container.removeEventListener('keydown', this.handleKeyDown);
      container.removeEventListener('blur', this.containerBlur);
      container.removeEventListener('click', this.handleCellClick);
    }
  }
}

export const gameGridEventsEnum = gridEventsEnum;
