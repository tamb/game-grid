import { fireCustomEvent } from "./utils";
import { gridEventsEnum } from "./enums";

const INITIAL_STATE = {
  active_coords: [0, 0],
  prev_coords: [0, 0],
  moves: [],
};

function GameGrid(query, config) {
  const _options = {
    infinite_x: true,
    infinite_y: true,
    maintain_squares: true,
    rewind_limit: 20,
    block_render: false,
    ...config.options,
  };
  const _matrix = config.matrix;

  let _state = {
    ...INITIAL_STATE,
    ...config.state,
  };

  const _root = document.querySelector(query);
  const _refs = {
    stage: createStage(),
    rows: [],
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

  function moveLeft() {
    fireCustomEvent(_refs.stage, gridEventsEnum.MOVE_LEFT, _state);
    setState({
      active_coords: [_state.active_coords[0], _state.active_coords[1] - 1],
      prev_coords: _state.active_coords,
    });
  }

  function moveUp() {
    fireCustomEvent(_refs.stage, gridEventsEnum.MOVE_UP, _state);
    setState({
      active_coords: [_state.active_coords[0] - 1, _state.active_coords[1]],
      prev_coords: _state.active_coords,
    });
  }

  function moveRight() {
    fireCustomEvent(_refs.stage, gridEventsEnum.MOVE_RIGHT, _state);
    setState({
      active_coords: [_state.active_coords[0], _state.active_coords[1] + 1],
      prev_coords: _state.active_coords,
    });
  }

  function moveDown() {
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
    const EL = _options.block_render ? _root : _refs.stage;
    EL.addEventListener("keydown", handleKeyDown);
    EL.addEventListener("focus", stageFocus);
    EL.addEventListener("blur", stageBlur);
  }
  function dettachHandlers() {
    console.log("detaching");
    const EL = _options.block_render ? _root : _refs.stage;
    EL.removeEventListener("keydown", handleKeyDown);
    EL.removeEventListener("focus", stageFocus);
    EL.removeEventListener("blur", stageBlur);
  }

  // RENDERERS
  function createStage() {
    const stage = document.createElement("div");
    stage.tabIndex = "0";
    stage.classList.add("GameGrid__stage");
    return stage;
  }

  function renderRow(index) {
    // todo accept index and render this way.
    _refs.rows[index] = _rows.map((_row, _rowIndex) => {
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
      _options.maintain_squares
        ? (newTile.style.maxWidth = `${100 / _row.length}%`)
        : null;

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
    if (!_options.block_render) {
      _matrix.forEach((row, i) => renderRow(i));

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
    }

    attachHandlers();
    fireCustomEvent(_refs.stage, gridEventsEnum.STAGE_RENDER);
  }

  return {
    destroy,
    render,
    moveLeft,
    moveUp,
    moveRight,
    moveDown,
    setState,
    getState,
  };
}

export default GameGrid;
