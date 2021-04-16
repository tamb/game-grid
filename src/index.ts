import "./styles.scss";

interface ICell {
  renderFunction?: (cell: HTMLDivElement) => HTMLElement;
  cellAttributes?: string[][];
  type: string | string[];
}
interface IState {
  active_coords?: number[];
  prev_coords?: number[];
  next_coords?: number[];
  moves?: number[][];
  current_direction?: string;
  rendered?: boolean;
}
interface IOptions {
  arrow_controls?: boolean;
  wasd_controls?: boolean;
  infinite_x?: boolean;
  infinite_y?: boolean;
  rewind_limit?: number;
  block_on_type?: string[];
  interact_on_type?: string[];
  move_on_type?: string[];
  // render options
  active_class?: string;
  container_class?: string;
  row_class?: string;
}

interface IConfig {
  options?: IOptions;
  matrix: ICell[][];
  state?: IState;
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
  rendered: false,
};

const DIRECTIONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
};

// TODO refactor as class with private methods
// in class add an optional render method -- do this last

export default class HtmlGameGrid {
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
      move_on_type: ["open"],
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
    this.init();
  }

  // API
  public getOptions():IOptions{
    return this.options;
  }
  public getRefs():IRefs{
    return this.refs;
  }
  public destroy(): void {
    this.dettachHandlers();
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
    this.refs.container.classList.add("lib-GameGridHtml");
    this.refs.container.setAttribute("tabindex", "0");
    const grid: DocumentFragment = document.createDocumentFragment();
    this.matrix.forEach((rowData: any, rI: number) => {
      const row: HTMLDivElement = document.createElement("div");
      this.options.row_class ? row.classList.add(this.options.row_class) : null;
      row.setAttribute("data-row-index", rI.toString());
      row.classList.add("lib-GameGridHtml__row");
      this.refs.cells.push([]);

      rowData.forEach((cellData: any, cI: number) => {
        const cell: HTMLDivElement = document.createElement("div");
        cell.setAttribute("data-row-index", rI.toString());
        cell.setAttribute("data-col-index", cI.toString());
        cell.setAttribute("data-coords", `${rI},${cI}`);
        cell.style.width = `${100 / rowData.length}%`;
        cellData.cellAttributes?.forEach((attr: string[]) => {
          cell.setAttribute(attr[0], attr[1]);
        });

        cell.classList.add("lib-GameGridHtml__cell");
        cell.setAttribute("tabindex", "0");
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
    if (row && col) {
      this.refs.cells[row][col].focus();
    } else {
      this.refs.cells[this.state.active_coords[0]][
        this.state.active_coords[1]
      ].focus();
    }
  }

  public setFocusToContainer(): void {
    this.refs.container.focus();
  }

  //INPUT
  private init(): void {
    this.attachHandlers();
  }

  private addToMoves(): void {
    this.state.moves.unshift(this.state.active_coords);
    if (this.state.moves.length > this.options.rewind_limit) {
      this.state.moves.pop();
    }
  }

  private testLimit(): void {
    console.log("test limit");
    // use state direction, and state active coords
    switch (this.state.current_direction) {
      case DIRECTIONS.DOWN:
        break;
      case DIRECTIONS.LEFT:
        break;
      case DIRECTIONS.RIGHT:
        break;
      case DIRECTIONS.UP:
        break;
    }
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
    this.state.rendered ? this.setFocusToCell() : null;
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
