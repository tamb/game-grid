import { renderDataAttributes } from "./utils";

interface IState {
  active_coords?: number[];
  prev_coords?: number[];
  next_coords?: number[];
  moves?: number[][];
  current_direction?: string;
}

interface IGameGrid {
  destroy: Function;
  init: Function;
  moveLeft: Function;
  moveUp: Function;
  moveRight: Function;
  moveDown: Function;
  setMatrix: Function;
  setStateSync: Function;
  getState: Function;
}

interface IOptions {
  active_class?: string;
  arrow_controls?: boolean;
  wasd_controls?: boolean;
  container_class?: string;
  row_class?: string;
  infinite_x?: boolean;
  infinite_y?: boolean;
  rewind_limit?: number;
  block_on_type?: string[];
  interact_on_type?: string[];
}

interface IConfig {
  options: IOptions;
  matrix: object[][];
  state: IState;
}

interface IRefs {
  container: HTMLElement;
  rows?: HTMLDivElement[];
  cells?: HTMLDivElement[][];
}

const INITIAL_STATE: IState = {
  active_coords: [0, 0],
  prev_coords: [0, 0],
  current_direction: "",
};

// TODO refactor as class with private methods
// in class add an optional render method -- do this last

class HtmlGameGrid {
  private options: IOptions;
  private matrix: Object[][];
  private refs: IRefs;
  private state: IState;

  constructor(query: string, config: IConfig) {
    this.options = {
      active_class: "gg-active",
      arrow_controls: true,
      wasd_controls: true,
      container_class: "",
      infinite_x: true,
      infinite_y: true,
      rewind_limit: 20,
      block_on_type: ["barrier"],
      interact_on_type: ["interactive"],
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
  }

  // API
  public destroy(): void {
    this.dettachHandlers();
  }
  public getState(): IState {
    return this.state;
  }
  public init(): void {
    this.attachHandlers();
  }

  public moveLeft(): void {
    this.setStateSync({
      next_coords: [
        this.state.active_coords[0],
        this.state.active_coords[1] - 1,
      ],
      current_direction: "left",
    });
    this.finishMove();
  }

  public moveUp(): void {
    this.setStateSync({
      next_coords: [
        this.state.active_coords[0] - 1,
        this.state.active_coords[1],
      ],
      current_direction: "up",
    });
    this.finishMove();
  }

  public moveRight(): void {
    this.setStateSync({
      next_coords: [
        this.state.active_coords[0],
        this.state.active_coords[1] + 1,
      ],
      current_direction: "right",
    });
    this.finishMove();
  }

  public moveDown(): void {
    this.setStateSync({
      next_coords: [
        this.state.active_coords[0] + 1,
        this.state.active_coords[1],
      ],
      current_direction: "down",
    });
    this.finishMove();
  }
  public setMatrix(m: object[][]): void {
    this.matrix = m;
  }
  public setStateSync(obj: IState): void {
    const newState: IState = { ...this.state, ...obj };
    this.state = newState;
  }

  public render(): void {
    const grid: DocumentFragment = document.createDocumentFragment();
    this.matrix.forEach((rowData: any, rI: number) => {
      const row: HTMLDivElement = document.createElement("div");
      this.options.row_class ? row.classList.add(this.options.row_class) : null;
      row.setAttribute("data-row-index", rI.toString());

      rowData.forEach((cellData: any, cI: number) => {
        // todo: fix this logic (not addressing nesting )
        const cell: HTMLDivElement = document.createElement("div");
        cell.setAttribute("data-row-index", rI.toString());
        cell.setAttribute("data-col-index", cI.toString());
        cell.setAttribute("data-coord", `${rI},${cI}`);
        cellData.attributes?.forEach((attr: string[][], attrI: number) => {
          cell.setAttribute(attr[attrI][0], attr[attrI][1]);
        });
        row.appendChild(cell);
        // todo: append cells to refs array or arrays
      });
      this.refs.rows.push(row);
      grid.appendChild(row);
    });
  }

  //INPUT
  private addToMoves(): void {
    this.state.moves.unshift(this.state.active_coords);
    if (this.state.moves.length > this.options.rewind_limit) {
      this.state.moves.pop();
    }
  }

  private testLimit(): void {
    console.log("test limit");
  }

  private testInteractive(): void {
    console.log("test interactive");
  }

  private testBarrier(): void {
    console.log("test barrier");
  }

  private finishMove(): void {
    this.testLimit();
    this.testInteractive();
    this.testBarrier();
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
    this.finishMove();
  }
  private handleKeyDown(event: KeyboardEvent): void {
    console.log(event);
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

  private containerFocus(): void {
    this.refs.container.classList.add(this.options.active_class);
  }

  private containerBlur(): void {
    this.refs.container.classList.remove(this.options.active_class);
  }

  // SET UP
  private attachHandlers(): void {
    this.refs.container.addEventListener("keydown", this.handleKeyDown);
    this.refs.container.addEventListener("focus", this.containerFocus);
    this.refs.container.addEventListener("blur", this.containerBlur);
  }
  private dettachHandlers(): void {
    this.refs.container.removeEventListener("keydown", this.handleKeyDown);
    this.refs.container.removeEventListener("focus", this.containerFocus);
    this.refs.container.removeEventListener("blur", this.containerBlur);
  }
}
