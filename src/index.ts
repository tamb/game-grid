interface IConfig {
  options: IOptions;
  matrix: object[][];
  state: IState;
}

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
  controls_class?: string;
  infinite_x?: boolean;
  infinite_y?: boolean;
  rewind_limit?: number;
  block_on_type?: string[];
  interact_on_type?: string[];
}

const INITIAL_STATE: IState = {
  active_coords: [0, 0],
  prev_coords: [0, 0],
  current_direction: "",
};

function GameGrid(query: string, config: IConfig): IGameGrid {
  const _options = {
    active_class: "gg-active",
    arrow_controls: true,
    wasd_controls: true,
    controls_class: "",
    infinite_x: true,
    infinite_y: true,
    rewind_limit: 20,
    block_on_type: ["barrier"],
    interact_on_type: ["interactive"],
    // overrides
    ...config.options,
  };
  const _controls = document.querySelector(query);
  let _matrix: object[][] = config.matrix;
  let _state = {
    ...INITIAL_STATE,
    ...config.state,
  };

  // API
  function destroy(): void {
    _dettachHandlers();
  }
  function getState(): IState {
    return _state;
  }
  function init(): void {
    _attachHandlers();
  }

  function moveLeft(): void {
    setStateSync({
      next_coords: [_state.active_coords[0], _state.active_coords[1] - 1],
      current_direction: "left",
    });
    _finishMove();
  }

  function moveUp(): void {
    setStateSync({
      next_coords: [_state.active_coords[0] - 1, _state.active_coords[1]],
      current_direction: "up",
    });
    _finishMove();
  }

  function moveRight(): void {
    setStateSync({
      next_coords: [_state.active_coords[0], _state.active_coords[1] + 1],
      current_direction: "right",
    });
    _finishMove();
  }

  function moveDown(): void {
    setStateSync({
      next_coords: [_state.active_coords[0] + 1, _state.active_coords[1]],
      current_direction: "down",
    });
    _finishMove();
  }
  function setMatrix(m: object[][]): void {
    _matrix = m;
  }
  function setStateSync(obj: IState): void {
    const newState: IState = { ..._state, ...obj };
    _state = newState;
  }

  //INPUT
  function _addToMoves(): void {
    _state.moves.unshift(_state.active_coords);
    if (_state.moves.length > _options.rewind_limit) {
      _state.moves.pop();
    }
  }

  function _testLimit(): void {
    console.log("test limit");
  }

  function _testInteractive(): void {
    console.log("test interactive");
  }

  function _testBarrier(): void {
    console.log("test barrier");
  }

  function _finishMove(): void {
    _testLimit();
    _testInteractive();
    _testBarrier();
    _addToMoves();
  }

  function _handleDirection(event: KeyboardEvent): void {
    switch (event.which) {
      case 37 || 65: {
        //left
        moveLeft();
        break;
      }
      case 38 || 87: {
        //up
        moveUp();
        break;
      }
      case 39 || 68: {
        //right
        moveRight();
        break;
      }
      case 40 || 83: {
        //down
        moveDown();
        break;
      }
    }
    _finishMove();
  }
  function _handleKeyDown(event: KeyboardEvent) {
    console.log(event);
    if (_options.arrow_controls) {
      if (
        event.which === 37 ||
        event.which === 38 ||
        event.which === 39 ||
        event.which === 40
      ) {
        event.preventDefault();
        _handleDirection(event);
      }
    }
    if (_options.wasd_controls) {
      if (
        event.which === 65 || //left
        event.which === 87 || //up
        event.which === 68 || // right
        event.which === 83 //down
      ) {
        event.preventDefault();
        _handleDirection(event);
      }
    }
  }

  function _controlsFocus() {
    _controls.classList.add(_options.active_class);
  }

  function _controlsBlur() {
    _controls.classList.remove(_options.active_class);
  }

  // SET UP
  function _attachHandlers() {
    _controls.addEventListener("keydown", _handleKeyDown);
    _controls.addEventListener("focus", _controlsFocus);
    _controls.addEventListener("blur", _controlsBlur);
  }
  function _dettachHandlers() {
    _controls.removeEventListener("keydown", _handleKeyDown);
    _controls.removeEventListener("focus", _controlsFocus);
    _controls.removeEventListener("blur", _controlsBlur);
  }

  return {
    destroy,
    init,
    moveLeft,
    moveUp,
    moveRight,
    moveDown,
    setMatrix,
    setStateSync,
    getState,
  };
}

export default GameGrid;
