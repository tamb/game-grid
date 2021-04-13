import { fireCustomEvent } from "./utils";
import { gridEventsEnum, tileTypeEnum } from "./enums";

/**
 * move
 * what is the next spot's type
 * what is custom type? -> fire event
 */

const INITIAL_STATE = {
  active_coords: [0, 0],
  prev_coords: [0, 0],
  moves: [],
};

function GameGrid2D(query, config) {
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
  let _matrix = config.matrix;
  let _state = {
    ...INITIAL_STATE,
    ...config.state,
  };
  let _move = "";

  // API
  function destroy() {
    _dettachHandlers();
  }
  function getState() {
    return _state;
  }
  function init() {
    _attachHandlers();
  }

  function moveLeft() {
    const nextCoords = [_state.active_coords[0], _state.active_coords[1] - 1];
    _move = "left";
  }

  function moveUp() {
    const nextCoords = [_state.active_coords[0] - 1, _state.active_coords[1]];
    _move = "up";
  }

  function moveRight() {
    const nextCoords = [_state.active_coords[0], _state.active_coords[1] + 1];
    _move = "right";
  }

  function moveDown() {
    const nextCoords = [_state.active_coords[0] + 1, _state.active_coords[1]];
    _move = "down";
  }
  function setMatrix(m) {
    _matrix = m;
  }
  function setStateSync(obj) {
    const newState = { ..._state, ...obj };
    _state = newState;
    // fireCustomEvent(_refs.controls, gridEventsEnum.STATE_UPDATED, _state);
  }
  function updateOptions(confObj) {
    _options = {
      ..._options,
      ...confObj,
    };
  }

  //INPUT
  function _addToMoves() {
    _state.moves.unshift(_state.active_coords);
    if (_state.moves.length > _options.rewind_limit) {
      _state.moves.pop();
    }
  }

  function _testLimit() {
    console.log(_state);
  }

  function _testInteractive() {}

  function _testBarrier() {}

  function _finishMove(nextCoords, event) {
    setStateSync({ active_coords: nextCoords });
    _testLimit();
    _testInteractive();
    _testBarrier();
    fireCustomEvent(_refs.controls, "move", _state);
    _addToMoves();
  }

  function _handleDirection(event) {
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
  function _handleKeyDown(event) {
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
    updateOptions,
  };
}

export default GameGrid2D;

/* 
initial render:
1) create controls _ref in memory
2) create row _refs individually 
3) inside create tile _refs individually
4) append each tile to row
5) append rows to controls
6) render controls to root


rerenderRow
1) create new row
2) create tiles
3) append tiles to row
4) update tile refs
5) replace row with new row
6) update row ref


rerenderTile
1) create new tile in memory
2) replace tile in DOM
3) reassign ref

*/
