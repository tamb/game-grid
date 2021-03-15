import { fireCustomEvent } from "./utils";

import { gridEventsEnum } from "./enums";

const INITIAL_STATE = {
  active_coords: [0, 0],
  prev_coords: [0, 0],
  moves: [],
};

function GameGrid(query, config) {
  const _options = config.options;
  const _matrix = config.matrix;

  let _state = {
    ...INITIAL_STATE,
    ...config.state,
  };

  const _root = document.querySelector(query);
  const _refs = {
    stage: createStage(),
    rows: null,
    tiles: [],
  };

  // API
  function destroy() {
    dettachHandlers();
  }

  function setState(obj) {
    const newState = { ..._state, ...obj };
    _state = newState;
    fireCustomEvent(_refs.stage, gridEventsEnum.STATE_UPDATED, _state);
  }
  function getState() {
    return _state;
  }

  //INPUT
  function addToMoves() {
    _state.moves.unshift(_state.active_coords);
    if (_state.moves.length > _options.rewind_limit) {
      _state.moves.pop();
    }
  }

  function moveLeft(event) {
    fireCustomEvent(_refs.stage, gridEventsEnum.MOVE_LEFT, _state);
    setState({
      active_coords: [_state.active_coords[0], _state.active_coords[1] - 1],
      prev_coords: _state.active_coords,
    });
  }

  function moveUp(event) {
    fireCustomEvent(_refs.stage, gridEventsEnum.MOVE_UP, _state);
    setState({
      active_coords: [_state.active_coords[0] - 1, _state.active_coords[1]],
      prev_coords: _state.active_coords,
    });
  }

  function moveRight(event) {
    fireCustomEvent(_refs.stage, gridEventsEnum.MOVE_RIGHT, _state);
    setState({
      active_coords: [_state.active_coords[0], _state.active_coords[1] + 1],
      prev_coords: _state.active_coords,
    });
  }

  function moveDown(event) {
    fireCustomEvent(_refs.stage, gridEventsEnum.MOVE_DOWN, _state);
    setState({
      active_coords: [_state.active_coords[0] + 1, _state.active_coords[1]],
      prev_coords: _state.active_coords,
    });
  }

  function handleDirection(event) {
    switch (event.which) {
      case 37: {
        moveLeft(event);
        break;
      }
      case 38: {
        moveUp(event);
        break;
      }
      case 39: {
        moveRight(event);
        break;
      }
      case 40: {
        moveDown(event);
        break;
      }
    }
    addToMoves();
  }
  function handleKeyDown(event) {
    if (
      event.which === 37 ||
      event.which === 38 ||
      event.which === 39 ||
      event.which === 40
    ) {
      event.preventDefault();
      handleDirection(event);
    }
  }

  function stageFocus() {
    _refs.stage.classList.add("active");
  }

  function stageBlur() {
    _refs.stage.classList.remove("active");
  }

  // SET UP
  function attachHandlers() {
    console.log("attaching");
    _refs.stage.addEventListener("keydown", handleKeyDown);
    _refs.stage.addEventListener("focus", stageFocus);
    _refs.stage.addEventListener("blur", stageBlur);
  }
  function dettachHandlers() {
    console.log("detaching");
    _refs.stage.removeEventListener("keydown", handleKeyDown);
    _refs.stage.removeEventListener("focus", stageFocus);
    _refs.stage.removeEventListener("blur", stageBlur);
  }

  // RENDERERS
  function createStage() {
    const stage = document.createElement("div");
    stage.tabIndex = "0";
    stage.classList.add("GameGrid__stage");
    return stage;
  }

  function renderRows(_rows) {
    _refs.rows = _rows.map((_row, _rowIndex) => {
      renderTilesByRow(_row, _rowIndex);
      const newRow = document.createElement("div");
      newRow.classList.add("GameGrid__row");
      return newRow;
    });
  }

  function renderTilesByRow(_row, _rowIndex) {
    _refs.tiles[_rowIndex] = _row.map((_tile, _tileIndex) => {
      const newTile = document.createElement("div");
      newTile.classList.add("GameGrid__tile");
      newTile.style.maxWidth = `${100 / _row.length}%`;

      if (_tile.renderObject) {
        newTile.appendChild(_tile.renderObject());
      }
      if (_tile.renderString) {
        newTile.insertAdjacentHTML("afterbegin", _tile.renderString());
      }

      return newTile;
    });
  }
  function render() {
    renderRows(_matrix);

    _refs.rows.forEach((row, index) => {
      const frag = document.createDocumentFragment();
      _refs.tiles[index].forEach((tile) => {
        frag.appendChild(tile);
      });
      row.appendChild(frag);
      _refs.stage.appendChild(row);
      fireCustomEvent(row, gridEventsEnum.ROW_RENDER);
    });

    _root.appendChild(_refs.stage);
    attachHandlers();
    fireCustomEvent(_refs.stage, gridEventsEnum.STAGE_RENDER);
  }

  return {
    destroy,
    render,
    setState,
    getState,
  };
}

export default GameGrid;
