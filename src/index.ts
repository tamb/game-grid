import { fireCustomEvent, renderAttributes, insertStyles } from './utils';
import { DIRECTIONS, INITIAL_STATE, gridEventsEnum } from './enums';
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
      active_class: 'gamegrid__cell--active',
      arrow_controls: true,
      wasd_controls: true,
      infinite_x: true,
      infinite_y: true,
      clickable: true,
      rewind_limit: 20,
      block_on_type: ['barrier'],
      collide_on_type: ['interactive'],
      move_on_type: ['open'],
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

  // API
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

  public getOptions(): IOptions {
    return this.options;
  }
  public setOptions(newOptions: IOptions): void {
    this.options = { ...this.options, ...newOptions };
  }
  public destroy(): void {
    this.state.rendered ? this.dettachHandlers() : null;
  }
  public getState(): IState {
    return this.state;
  }

  public moveLeft(): void {
    this.setStateSync({
      next_coords: [
        this.state.active_coords![0],
        this.state.active_coords![1] - 1,
      ],
      current_direction: DIRECTIONS.LEFT,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_LEFT);
    this.finishMove();
  }

  public moveUp(): void {
    this.setStateSync({
      next_coords: [
        this.state.active_coords![0] - 1,
        this.state.active_coords![1],
      ],
      current_direction: DIRECTIONS.UP,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_UP);
    this.finishMove();
  }

  public moveRight(): void {
    this.setStateSync({
      next_coords: [
        this.state.active_coords![0],
        this.state.active_coords![1] + 1,
      ],
      current_direction: DIRECTIONS.RIGHT,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_RIGHT);
    this.finishMove();
  }

  public moveDown(): void {
    this.setStateSync({
      next_coords: [
        this.state.active_coords![0] + 1,
        this.state.active_coords![1],
      ],
      current_direction: DIRECTIONS.DOWN,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_DOWN);
    this.finishMove();
  }
  public setMatrix(m: ICell[][]): void {
    this.matrix = m;
  }

  public getMatrix(): ICell[][] {
    return this.matrix;
  }
  public setStateSync(obj: any): void {
    const newState: IState = { ...this.state, ...obj };
    this.state = newState;
  }

  public getActiveCell(): HTMLDivElement {
    return this.refs.cells[this.state.active_coords![0]][
      this.state.active_coords![1]
    ];
  }

  //private methods
  private render(): void {
    if (this.refs && this.refs.container) {
      insertStyles();
      this.refs.container.classList.add('gamegrid');
      this.refs.container.setAttribute('tabindex', '0');
      this.refs.container.setAttribute('data-gamegrid-ref', 'container');
      const grid: DocumentFragment = document.createDocumentFragment();
      this.matrix.forEach((rowData: ICell[], rI: number) => {
        const row: HTMLDivElement = document.createElement('div');
        this.options.row_class
          ? row.classList.add(this.options.row_class)
          : null;
        row.setAttribute('data-gamegrid-row-index', rI.toString());
        row.setAttribute('data-gamegrid-ref', 'row');
        row.classList.add('gamegrid__row');
        this.refs?.cells.push([]);

        rowData.forEach((cellData: ICell, cI: number) => {
          const cell: HTMLDivElement = document.createElement('div');
          renderAttributes(cell, [
            ['data-gamegrid-ref', 'cell'],
            ['data-gamegrid-row-index', rI.toString()],
            ['data-gamegrid-col-index', cI.toString()],
            ['data-gamegrid-coords', `${rI},${cI}`],
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
          row.appendChild(cell);
          this.refs?.cells[rI].push(cell);
        });
        this.refs?.rows.push(row);
        grid.appendChild(row);
      });
      this.refs.container.appendChild(grid);
      this.setStateSync({ rendered: true });
    } else {
      throw new Error('No container found');
    }
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
      this.setStateSync({ active_coords: [row, col] });
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

  private addToMoves(): void {
    const clonedMoves = [...this.getState().moves];
    clonedMoves.unshift(this.state.active_coords);
    if (clonedMoves.length > this.options.rewind_limit!) {
      clonedMoves.shift();
    }
    this.setStateSync({ moves: clonedMoves });
  }

  private testLimit(): void {
    // use state direction, and state active coords
    let row: number = this.state.next_coords![0];
    let col: number = this.state.next_coords![1];
    const rowFinalIndex: number = this.matrix.length - 1;
    const colFinalIndex: number =
      this.matrix[this.state.active_coords[0]].length - 1; // todo: test for variable col length

    switch (this.state.current_direction) {
      case DIRECTIONS.DOWN:
        if (this.state.next_coords[0] > rowFinalIndex) {
          if (!this.options.infinite_y) {
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
      case DIRECTIONS.LEFT:
        if (this.state.next_coords[1] < 0) {
          if (this.options.infinite_x) {
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
      case DIRECTIONS.RIGHT:
        if (this.state.next_coords[1] > colFinalIndex) {
          if (!this.options.infinite_x) {
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
      case DIRECTIONS.UP:
        if (this.state.next_coords[0] < 0) {
          if (this.options.infinite_y) {
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
      next_coords: [row, col],
      active_coords: [row, col],
      prev_coords: this.state.active_coords,
    });
  }

  private testInteractive(): void {
    const coords = this.state.next_coords;
    if (this.matrix[coords[0]][coords[1]]?.type === 'interactive') {
      fireCustomEvent.call(this, gridEventsEnum.MOVE_COLLISION);
    }
  }

  private testBarrier(): void {
    const coords = this.state.next_coords;
    if (this.matrix[coords[0]][coords[1]]?.type === 'barrier') {
      this.setStateSync({
        active_coords: this.state.prev_coords,
        prev_coords: this.state.active_coords,
      });
      fireCustomEvent.call(this, gridEventsEnum.MOVE_BLOCKED);
    }
  }

  private testSpace(): void {
    const coords = this.state.next_coords;
    if (this.matrix[coords[0]][coords[1]]?.type === 'open') {
      if (
        this.matrix[this.state.prev_coords[0]][this.state.prev_coords[1]]
          .type === 'interactive'
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
    if (this.options.arrow_controls) {
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
    if (this.options.wasd_controls) {
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

  private containerFocus = (): void => {
    this.options.active_class
      ? this.refs.container!.classList.add(this.options.active_class)
      : null;
  };

  private containerBlur = (): void => {
    this.options.active_class
      ? this.refs.container!.classList.remove(this.options.active_class)
      : null;
  };

  // SET UP
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
