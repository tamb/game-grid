import { fireCustomEvent, renderAttributes, insertStyles } from './utils';
import {
  directionsEnum,
  INITIAL_STATE,
  cellTypeEnum,
  gridEventsEnum,
  elementsEnum,
} from './enums';
import {
  IState,
  IOptions,
  ICell,
  IRefs,
  IConfig,
  IGameGrid,
} from './interfaces';

export default class GameGrid implements IGameGrid {
  public options: IOptions;
  private matrix: ICell[][];
  private state: IState = INITIAL_STATE;
  public refs: IRefs = {
    container: null,
    rows: [],
    cells: [],
  };

  constructor(config: IConfig, container: HTMLElement | null = null) {
    this.options = {
      activeClass: 'gamegrid__cell--active',
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

    this.matrix = config.matrix;
    this.state = {
      ...INITIAL_STATE,
      ...config.state,
    };

    if (container) {
      this.renderGrid(container);
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
  public renderGrid(container: HTMLElement): void {
    this.refs = {
      container: container,
      rows: [],
      cells: [],
    };
    this.render();
    this.attachHandlers();
    fireCustomEvent.call(this, gridEventsEnum.RENDERED);
  }

  private render(): void {
    if (this.refs && this.refs.container) {
      insertStyles();
      const grid: DocumentFragment = document.createDocumentFragment();

      this.renderContainer();

      this.matrix.forEach((rowData: ICell[], rI: number) => {
        const row: HTMLDivElement = this.renderRow(rI);
        this.refs?.cells.push([]);

        rowData.forEach((cellData: ICell, cI: number) => {
          const cell: HTMLDivElement = this.renderCell(
            rI,
            cI,
            cellData,
            rowData,
          );
          row.appendChild(cell);
          this.refs.cells[rI].push(cell);
        });
        this.refs.rows.push(row);
        grid.appendChild(row);
      });
      this.refs.container.appendChild(grid);
      this.setStateSync({ rendered: true });
    } else {
      throw new Error('No container found');
    }
  }

  private renderContainer(): void {
    this.refs.container!.classList.add('gamegrid');
    this.refs.container!.setAttribute('tabindex', '0');
    this.refs.container!.setAttribute('data-gamegrid-ref', 'container');
  }

  private renderRow(rI: number): HTMLDivElement {
    const row: HTMLDivElement = document.createElement(elementsEnum.ROW);
    this.options.rowClass ? row.classList.add(this.options.rowClass) : null;
    row.setAttribute('data-gamegrid-row-index', rI.toString());
    row.setAttribute('data-gamegrid-ref', 'row');
    row.classList.add('gamegrid__row');
    return row;
  }

  private renderCell(
    rI: number,
    cI: number,
    cellData: ICell,
    rowData: ICell[],
  ): HTMLDivElement {
    const cell: HTMLDivElement = document.createElement(elementsEnum.CELL);
    renderAttributes(cell, [
      ['data-gamegrid-ref', 'cell'],
      ['data-gamegrid-row-index', rI.toString()],
      ['data-gamegrid-col-index', cI.toString()],
      ['data-gamegrid-coords', `${rI},${cI}`],
      ['data-gamegrid-cell-type', cellData.type || cellTypeEnum.OPEN],
    ]);

    cell.style.width = `${100 / rowData.length}%`;
    cellData.cellAttributes?.forEach((attr: string[]) => {
      cell.setAttribute(attr[0], attr[1]);
    });

    cell.classList.add('gamegrid__cell');
    cell.setAttribute('tabindex', this.options.clickable ? '0' : '-1');
    if (cellData.renderFunction) {
      cell.appendChild(cellData.renderFunction(this));
    }
    return cell;
  }

  private setFocusToCell(row?: number, col?: number): void {
    const cells = this.refs.cells;
    if (!cells) {
      throw new Error('No cells found');
    }
    if (typeof row === 'number' && typeof col === 'number') {
      cells[row][col].focus();
      this.removeActiveClasses();
      cells[row][col].classList.add('gamegrid__cell--active');
      this.setStateSync({ activeCoords: [row, col] });
    } else {
      this.getActiveCell()?.focus();
      this.removeActiveClasses();
      this.getActiveCell()?.classList.add('gamegrid__cell--active');
    }
  }

  private removeActiveClasses(): void {
    this.refs.cells.forEach((cellRow) => {
      cellRow.forEach((cell) => {
        cell.classList.remove('gamegrid__cell--active');
      });
    });
  }

  private containerFocus = (): void => {
    this.options.activeClass
      ? this.refs.container!.classList.add(this.options.activeClass)
      : null;
  };

  private containerBlur = (): void => {
    this.options.activeClass
      ? this.refs.container!.classList.remove(this.options.activeClass)
      : null;
  };

  public getActiveCell(): HTMLDivElement {
    return this.refs.cells[this.state.activeCoords![0]][
      this.state.activeCoords![1]
    ];
  }

  // MOVEMENT
  public moveLeft(): void {
    this.setStateSync({
      nextCoords: [
        this.state.activeCoords![0],
        this.state.activeCoords![1] - 1,
      ],
      currentDirection: directionsEnum.LEFT,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_LEFT);
    this.finishMove();
  }

  public moveUp(): void {
    this.setStateSync({
      nextCoords: [
        this.state.activeCoords![0] - 1,
        this.state.activeCoords![1],
      ],
      currentDirection: directionsEnum.UP,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_UP);
    this.finishMove();
  }

  public moveRight(): void {
    this.setStateSync({
      nextCoords: [
        this.state.activeCoords![0],
        this.state.activeCoords![1] + 1,
      ],
      currentDirection: directionsEnum.RIGHT,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_RIGHT);
    this.finishMove();
  }

  public moveDown(): void {
    this.setStateSync({
      nextCoords: [
        this.state.activeCoords![0] + 1,
        this.state.activeCoords![1],
      ],
      currentDirection: directionsEnum.DOWN,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_DOWN);
    this.finishMove();
  }

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
    let row: number = this.state.nextCoords![0];
    let col: number = this.state.nextCoords![1];
    const rowFinalIndex: number = this.matrix.length - 1;
    const colFinalIndex: number =
      this.matrix[this.state.activeCoords[0]].length - 1; // todo: test for variable col length

    switch (this.state.currentDirection) {
      case directionsEnum.DOWN:
        if (this.state.nextCoords[0] > rowFinalIndex) {
          if (!this.options.infiniteY) {
            row = rowFinalIndex;
            fireCustomEvent.call(this, gridEventsEnum.LIMIT_Y);
            fireCustomEvent.call(this, gridEventsEnum.LIMIT);
          } else {
            row = 0;
            fireCustomEvent.call(this, gridEventsEnum.WRAP_Y);
            fireCustomEvent.call(this, gridEventsEnum.WRAP);
          }
        }
        break;
      case directionsEnum.LEFT:
        if (this.state.nextCoords[1] < 0) {
          if (this.options.infiniteX) {
            col = colFinalIndex;
            fireCustomEvent.call(this, gridEventsEnum.WRAP_X);
            fireCustomEvent.call(this, gridEventsEnum.WRAP);
          } else {
            col = 0;
            fireCustomEvent.call(this, gridEventsEnum.LIMIT_X);
            fireCustomEvent.call(this, gridEventsEnum.LIMIT);
          }
        }
        break;
      case directionsEnum.RIGHT:
        if (this.state.nextCoords[1] > colFinalIndex) {
          if (!this.options.infiniteX) {
            col = colFinalIndex;
            fireCustomEvent.call(this, gridEventsEnum.LIMIT_X);
            fireCustomEvent.call(this, gridEventsEnum.LIMIT);
          } else {
            col = 0;
            fireCustomEvent.call(this, gridEventsEnum.WRAP_X);
            fireCustomEvent.call(this, gridEventsEnum.WRAP);
          }
        }
        break;
      case directionsEnum.UP:
        if (this.state.nextCoords[0] < 0) {
          if (this.options.infiniteY) {
            row = rowFinalIndex;
            fireCustomEvent.call(this, gridEventsEnum.WRAP_Y);
            fireCustomEvent.call(this, gridEventsEnum.WRAP);
          } else {
            row = 0;
            fireCustomEvent.call(this, gridEventsEnum.LIMIT_Y);
            fireCustomEvent.call(this, gridEventsEnum.LIMIT);
          }
        }
        break;
    }

    this.setStateSync({
      nextCoords: [row, col],
      activeCoords: [row, col],
      prevCoords: this.state.activeCoords,
    });
  }

  private testInteractive(): void {
    const coords = this.state.nextCoords;
    if (this.matrix[coords[0]][coords[1]]?.type === cellTypeEnum.INTERACTIVE) {
      fireCustomEvent.call(this, gridEventsEnum.MOVE_COLLISION);
    }
  }

  private testBarrier(): void {
    const coords = this.state.nextCoords;
    if (this.matrix[coords[0]][coords[1]]?.type === cellTypeEnum.BARRIER) {
      this.setStateSync({
        activeCoords: this.state.prevCoords,
        prevCoords: this.state.activeCoords,
      });
      fireCustomEvent.call(this, gridEventsEnum.MOVE_BLOCKED);
    }
  }

  private testSpace(): void {
    const coords = this.state.nextCoords;
    if (this.matrix[coords[0]][coords[1]]?.type === cellTypeEnum.OPEN) {
      if (
        this.matrix[this.state.prevCoords[0]][this.state.prevCoords[1]].type ===
        cellTypeEnum.INTERACTIVE
      ) {
        fireCustomEvent.call(this, gridEventsEnum.MOVE_DETTACH);
      }
    }
  }

  private finishMove(): void {
    this.testLimit();
    this.testSpace();
    this.testInteractive();
    this.testBarrier();
    this.state.rendered ? this.setFocusToCell() : null;
    this.addToMoves();
    fireCustomEvent.call(this, gridEventsEnum.MOVE_LAND);
  }

  // EVENT HANDLERS
  private handleDirection(event: KeyboardEvent): void {
    switch (event.code) {
      case 'ArrowLeft': {
        //left
        this.moveLeft();
        break;
      }
      case 'KeyA': {
        //left
        this.moveLeft();
        break;
      }
      case 'ArrowUp': {
        //up
        this.moveUp();
        break;
      }
      case 'KeyW': {
        //up
        this.moveUp();
        break;
      }
      case 'ArrowRight': {
        //right
        this.moveRight();
        break;
      }
      case 'KeyD': {
        //right
        this.moveRight();
        break;
      }
      case 'ArrowDown': {
        //down
        this.moveDown();
        break;
      }
      case 'KeyS': {
        //down
        this.moveDown();
        break;
      }
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.options.arrowControls) {
      if (
        event.code === 'ArrowUp' ||
        event.code === 'ArrowRight' ||
        event.code === 'ArrowDown' ||
        event.code === 'ArrowLeft'
      ) {
        event.preventDefault();
        this.handleDirection(event);
      }
    }
    if (this.options.wasdControls) {
      if (
        event.code === 'KeyW' ||
        event.code === 'KeyD' ||
        event.code === 'KeyS' ||
        event.code === 'KeyA'
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
            this.setFocusToCell(...coords);
          } else {
            this.setFocusToCell();
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
      container.addEventListener('focus', this.containerFocus);
      container.addEventListener('blur', this.containerBlur);
      container.addEventListener('click', this.handleCellClick);
    }
  }

  private dettachHandlers(): void {
    const container = this.refs.container;
    if (container) {
      container.removeEventListener('keydown', this.handleKeyDown);
      container.removeEventListener('focus', this.containerFocus);
      container.removeEventListener('blur', this.containerBlur);
      container.removeEventListener('click', this.handleCellClick);
    }
  }
}

export const gameGridEventsEnum = gridEventsEnum;
