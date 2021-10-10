import "./styles.scss";

import { fireCustomEvent, renderAttributes } from "./utils";
import { gridEventsEnum } from "./enums";
import { IState, IOptions, ICell, IRefs, IConfig } from "./interfaces";

const INITIAL_STATE: IState = {
  active_coords: [0, 0],
  prev_coords: [0, 0],
  current_direction: "",
  rendered: false,
  moves: [[0, 0]],
};

const DIRECTIONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
};

export default class HtmlGameGrid {
  private options: IOptions;
  private matrix: ICell[][];
  private refs: IRefs;
  private state: IState;

  constructor(query: string, config: IConfig) {
    this.options = {
      // active_class: "gamegrid-active",
      arrow_controls: true,
      wasd_controls: true,
      // container_class: "",
      infinite_x: true,
      infinite_y: true,
      clickable: true,
      rewind_limit: 20,

      // block_on_type: ["barrier"],
      // interact_on_type: ["interactive"],
      // move_on_type: ["open"],
      // overrides
      ...config.options,
    };
    this.refs = {
      container: document.querySelector(query),
      rows: [],
      cells: [],
    };
    this.matrix = config.matrix;
    this.state = {
      ...INITIAL_STATE,
      ...config.state,
    };
    this.containerFocus = this.containerFocus.bind(this);
    this.containerBlur = this.containerBlur.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleCellClick = this.handleCellClick.bind(this);
    this.init();
  }

  // API
  public getOptions(): IOptions {
    return this.options;
  }
  public setOptions(newOptions: IOptions): void {
    this.options = { ...this.options, ...newOptions };
  }
  public getRefs(): IRefs {
    return this.refs;
  }
  public destroy(): void {
    this.state.rendered ? this.dettachHandlers() : null;
    this.refs = {
      ...this.refs,
      rows: [],
      cells: [],
    };
  }
  public getState(): IState {
    return this.state;
  }

  public moveLeft(): void {
    this.setStateSync({
      next_coords: [
        this.state.active_coords[0],
        this.state.active_coords[1] - 1,
      ],
      current_direction: DIRECTIONS.LEFT,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_LEFT);
    this.finishMove();
  }

  public moveUp(): void {
    this.setStateSync({
      next_coords: [
        this.state.active_coords[0] - 1,
        this.state.active_coords[1],
      ],
      current_direction: DIRECTIONS.UP,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_UP);
    this.finishMove();
  }

  public moveRight(): void {
    this.setStateSync({
      next_coords: [
        this.state.active_coords[0],
        this.state.active_coords[1] + 1,
      ],
      current_direction: DIRECTIONS.RIGHT,
    });
    fireCustomEvent.call(this, gridEventsEnum.MOVE_RIGHT);
    this.finishMove();
  }

  public moveDown(): void {
    this.setStateSync({
      next_coords: [
        this.state.active_coords[0] + 1,
        this.state.active_coords[1],
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
  public setStateSync(obj: IState): void {
    const newState: IState = { ...this.state, ...obj };
    this.state = newState;
    fireCustomEvent.call(this, gridEventsEnum.STATE_UPDATED);
  }

  public render(): void {
    this.refs.container.classList.add("gamegrid");
    this.refs.container.setAttribute("tabindex", "0");
    this.refs.container.setAttribute("data-gamegrid-ref", "container");
    const grid: DocumentFragment = document.createDocumentFragment();
    this.matrix.forEach((rowData: any, rI: number) => {
      const row: HTMLDivElement = document.createElement("div");
      this.options.row_class ? row.classList.add(this.options.row_class) : null;
      row.setAttribute("data-gamegrid-row-index", rI.toString());
      row.setAttribute("data-gamegrid-ref", "row");
      row.classList.add("gamegrid__row");
      this.refs.cells.push([]);

      rowData.forEach((cellData: any, cI: number) => {
        const cell: HTMLDivElement = document.createElement("div");
        renderAttributes(cell, [
          ["data-gamegrid-ref", "cell"],
          ["data-gamegrid-row-index", rI.toString()],
          ["data-gamegrid-col-index", cI.toString()],
          ["data-gamegrid-coords", `${rI},${cI}`],
        ]);

        cell.style.width = `${100 / rowData.length}%`;
        cellData.cellAttributes?.forEach((attr: string[]) => {
          cell.setAttribute(attr[0], attr[1]);
        });

        cell.classList.add("gamegrid__cell");
        cell.setAttribute("tabindex", this.options.clickable ? "0" : "-1");
        if (cellData.renderFunction) {
          cell.appendChild(cellData.renderFunction());
        }
        row.appendChild(cell);
        this.refs.cells[rI].push(cell);
      });
      this.refs.rows.push(row);
      grid.appendChild(row);
    });
    this.refs.container.appendChild(grid);
    this.setStateSync({ rendered: true });
    fireCustomEvent.call(this, gridEventsEnum.RENDERED);
  }

  private setFocusToCell(row?: number, col?: number): void {
    const cells = this.getRefs().cells;
    if (typeof row === "number" && typeof col === "number") {
      cells[row][col].focus();
      this.removeActiveClasses();
      cells[row][col].classList.add("gamegrid__cell--active");
      this.setStateSync({ active_coords: [row, col] });
    } else {
      this.getActiveCell()?.focus();
      this.removeActiveClasses();
      this.getActiveCell()?.classList.add("gamegrid__cell--active");
    }
  }

  public getActiveCell(): HTMLDivElement {
    return this.getRefs().cells[this.state.active_coords[0]][
      this.state.active_coords[1]
    ];
  }

  //INPUT
  public init(): void {
    this.state.rendered ? this.attachHandlers() : null;
  }

  private removeActiveClasses(): void {
    this.getRefs().cells.forEach((cellRow) => {
      cellRow.forEach((cell) => {
        cell.classList.remove("gamegrid__cell--active");
      });
    });
  }

  private addToMoves(): void {
    const clonedMoves = [...this.getState().moves];
    clonedMoves.unshift(this.state.active_coords);
    if (clonedMoves.length > this.options.rewind_limit) {
      clonedMoves.shift();
    }
    this.setStateSync({ moves: clonedMoves });
  }

  private testLimit(): void {
    // use state direction, and state active coords
    let row: number = this.state.next_coords[0];
    let col: number = this.state.next_coords[1];
    let rowFinalIndex: number = this.matrix.length - 1;
    let colFinalIndex: number =
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
    if (this.matrix[coords[0]][coords[1]]?.type === "interactive") {
      fireCustomEvent.call(this, gridEventsEnum.MOVE_COLLISION);
    }
  }

  private testBarrier(): void {
    const coords = this.state.next_coords;
    if (this.matrix[coords[0]][coords[1]]?.type === "barrier") {
      this.setStateSync({
        active_coords: this.state.prev_coords,
        prev_coords: this.state.active_coords,
      });
      fireCustomEvent.call(this, gridEventsEnum.MOVE_BLOCKED);
    }
  }

  private testSpace(): void {
    const coords = this.state.next_coords;
    if (this.matrix[coords[0]][coords[1]]?.type === "open") {
      if (
        this.matrix[this.state.prev_coords[0]][this.state.prev_coords[1]]
          .type === "interactive"
      ) {
        fireCustomEvent.call(this, gridEventsEnum.MOVE_DETTACH);
      }
      fireCustomEvent.call(this, gridEventsEnum.MOVE_LAND);
    }
  }

  private finishMove(): void {
    this.testLimit();
    this.testSpace();
    this.testInteractive();
    this.testBarrier();
    this.state.rendered ? this.setFocusToCell() : null;
    this.addToMoves();
  }

  private handleDirection(event: KeyboardEvent): void {
    switch (event.code) {
      case "ArrowLeft": {
        //left
        this.moveLeft();
        break;
      }
      case "KeyA": {
        //left
        this.moveLeft();
        break;
      }
      case "ArrowUp": {
        //up
        this.moveUp();
        break;
      }
      case "KeyW": {
        //up
        this.moveUp();
        break;
      }
      case "ArrowRight": {
        //right
        this.moveRight();
        break;
      }
      case "KeyD": {
        //right
        this.moveRight();
        break;
      }
      case "ArrowDown": {
        //down
        this.moveDown();
        break;
      }
      case "KeyS": {
        //down
        this.moveDown();
        break;
      }
    }
  }
  private handleKeyDown(event: KeyboardEvent): void {
    if (this.options.arrow_controls) {
      if (
        event.code === "ArrowUp" ||
        event.code === "ArrowRight" ||
        event.code === "ArrowDown" ||
        event.code === "ArrowLeft"
      ) {
        event.preventDefault();
        this.handleDirection(event);
      }
    }
    if (this.options.wasd_controls) {
      if (
        event.code === "KeyW" ||
        event.code === "KeyD" ||
        event.code === "KeyS" ||
        event.code === "KeyA"
      ) {
        event.preventDefault();
        this.handleDirection(event);
      }
    }
  }

  private handleCellClick(event: MouseEvent): void {
    if (this.getOptions().clickable) {
      if (event.target instanceof HTMLElement) {
        const cellEl: HTMLElement = event.target.closest(
          '[data-gamegrid-ref="cell"]'
        );
        if (cellEl) {
          const coords: number[] = cellEl
            .getAttribute("data-gamegrid-coords")
            .split(",")
            .map((n) => Number(n));
          this.setFocusToCell(...coords);
        } else {
          this.setFocusToCell();
        }
      }
    }
  }

  private containerFocus(): void {
    this.getRefs().container.classList.add(this.options.active_class);
  }

  private containerBlur(): void {
    this.getRefs().container.classList.remove(this.options.active_class);
  }

  // SET UP
  private attachHandlers(): void {
    this.getRefs().container.addEventListener("keydown", this.handleKeyDown);
    this.getRefs().container.addEventListener("focus", this.containerFocus);
    this.getRefs().container.addEventListener("blur", this.containerBlur);
    this.getRefs().container.addEventListener("click", this.handleCellClick);
  }
  private dettachHandlers(): void {
    this.getRefs().container.removeEventListener("keydown", this.handleKeyDown);
    this.getRefs().container.removeEventListener("focus", this.containerFocus);
    this.getRefs().container.removeEventListener("blur", this.containerBlur);
    this.getRefs().container.removeEventListener("click", this.handleCellClick);
  }
}
