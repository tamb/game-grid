import "./styles.scss";

import { fireCustomEvent } from "./utils";
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
      // active_class: "gg-active",
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
    this.dettachHandlers();
  }
  public getState(): IState {
    return this.state;
  }

  public moveLeft(): void {
    console.log("left");
    this.setStateSync({
      next_coords: [
        this.state.active_coords[0],
        this.state.active_coords[1] - 1,
      ],
      current_direction: DIRECTIONS.LEFT,
    });
    this.finishMove();
  }

  public moveUp(): void {
    console.log("up");
    this.setStateSync({
      next_coords: [
        this.state.active_coords[0] - 1,
        this.state.active_coords[1],
      ],
      current_direction: DIRECTIONS.UP,
    });
    this.finishMove();
  }

  public moveRight(): void {
    console.log("right");

    this.setStateSync({
      next_coords: [
        this.state.active_coords[0],
        this.state.active_coords[1] + 1,
      ],
      current_direction: DIRECTIONS.RIGHT,
    });
    this.finishMove();
  }

  public moveDown(): void {
    console.log("down");

    this.setStateSync({
      next_coords: [
        this.state.active_coords[0] + 1,
        this.state.active_coords[1],
      ],
      current_direction: DIRECTIONS.DOWN,
    });
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
  }

  public render(): void {
    this.refs.container.classList.add("lib-GameGridHtml");
    this.refs.container.setAttribute("tabindex", "0");
    this.refs.container.setAttribute("data-gg-ref", "container");
    const grid: DocumentFragment = document.createDocumentFragment();
    this.matrix.forEach((rowData: any, rI: number) => {
      const row: HTMLDivElement = document.createElement("div");
      this.options.row_class ? row.classList.add(this.options.row_class) : null;
      row.setAttribute("data-gg-row-index", rI.toString());
      row.setAttribute("data-gg-ref", "row");
      row.classList.add("lib-GameGridHtml__row");
      this.refs.cells.push([]);

      rowData.forEach((cellData: any, cI: number) => {
        const cell: HTMLDivElement = document.createElement("div");
        cell.setAttribute("data-gg-ref", "cell");
        cell.setAttribute("data-gg-row-index", rI.toString());
        cell.setAttribute("data-gg-col-index", cI.toString());
        cell.setAttribute("data-gg-coords", `${rI},${cI}`);
        cell.style.width = `${100 / rowData.length}%`;
        cellData.cellAttributes?.forEach((attr: string[]) => {
          cell.setAttribute(attr[0], attr[1]);
        });

        cell.classList.add("lib-GameGridHtml__cell");
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
  }

  public setFocusToCell(row?: number, col?: number): void {
    const cells = this.getRefs().cells;
    if (typeof row === "number" && typeof col === "number") {
      cells[row][col].focus();
      this.setStateSync({ active_coords: [row, col] });
    } else {
      cells[this.state.active_coords[0]][this.state.active_coords[1]].focus();
    }
  }

  public setFocusToContainer(): void {
    this.getRefs().container.focus();
  }

  public getActiveCell(): HTMLDivElement {
    return this.getRefs().cells[this.state.active_coords[0]][
      this.state.active_coords[1]
    ];
  }

  //INPUT
  private init(): void {
    this.attachHandlers();
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
    let colFinalIndex: number = this.matrix[this.state.active_coords[0]].length - 1; // todo: test for variable col length

    switch (this.state.current_direction) {
      case DIRECTIONS.DOWN:
        if (this.state.next_coords[0] > rowFinalIndex) {
          if (!this.options.infinite_y) {
            row = rowFinalIndex;
          } else {
            row = 0;
          }
        }
        break;
      case DIRECTIONS.LEFT:
        if (this.state.next_coords[1] < 0) {
          if (this.options.infinite_x) {
            col = colFinalIndex;
          } else {
            col = 0;
          }
        }
        break;
      case DIRECTIONS.RIGHT:
        if (this.state.next_coords[1] > colFinalIndex) {
          if (!this.options.infinite_x) {
            col = colFinalIndex;
          } else {
            col = 0;
          }
        }
        break;
      case DIRECTIONS.UP:
        if (this.state.next_coords[0] < 0) {
          if (this.options.infinite_y) {
            row = rowFinalIndex;
          } else {
            row = 0;
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
    if (this.matrix[coords[0]][coords[1]].type === "interactive") {
      fireCustomEvent(this.getActiveCell(), gridEventsEnum.MOVE_COLLISION, {
        gg_instance: this,
      });
    }
  }

  private testBarrier(): void {
    const coords = this.state.next_coords;
    if (this.matrix[coords[0]][coords[1]].type === "barrier") {
      this.setStateSync({
        active_coords: this.state.prev_coords,
        prev_coords: this.state.active_coords,
      });
      fireCustomEvent(this.getActiveCell(), gridEventsEnum.MOVE_BLOCKED, {
        gg_instance: this,
      });
    }
  }

  private testSpace(): void {
    const coords = this.state.next_coords;
    if (this.matrix[coords[0]][coords[1]].type === "open") {
      fireCustomEvent(this.getActiveCell(), gridEventsEnum.MOVE_LAND, {
        gg_instance: this,
      });
    }
  }

  private finishMove(): void {
    this.testLimit();
    this.testSpace();
    this.testInteractive();
    this.testBarrier();
    // this.state.rendered ? this.setFocusToCell() : null;
    this.setFocusToCell();
    this.addToMoves();
  }

  private handleDirection(event: KeyboardEvent): void {
    switch (event.which) {
      case 37 || 65: {
        //left
        this.moveLeft();
        break;
      }
      case 38 || 87: {
        //up
        this.moveUp();
        break;
      }
      case 39 || 68: {
        //right
        this.moveRight();
        break;
      }
      case 40 || 83: {
        //down
        this.moveDown();
        break;
      }
    }
  }
  private handleKeyDown(event: KeyboardEvent): void {
    if (this.options.arrow_controls) {
      if (
        event.which === 37 ||
        event.which === 38 ||
        event.which === 39 ||
        event.which === 40
      ) {
        event.preventDefault();
        this.handleDirection(event);
      }
    }
    if (this.options.wasd_controls) {
      if (
        event.which === 65 || //left
        event.which === 87 || //up
        event.which === 68 || // right
        event.which === 83 //down
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
          '[data-gg-ref="cell"]'
        );
        if (cellEl) {
          const coords: number[] = cellEl
            .getAttribute("data-gg-coords")
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
