import { fireCustomEvent, mapRowColIndicesToXY } from "./utils";
import { gridEventsEnum, tileTypeEnum } from "./enums";

const INITIAL_STATE = {
  active_coords: [0, 0],
  prev_coords: [0, 0],
  moves: [],
  row_col:[0,0],
  xy: mapRowColIndicesToXY(...[0,0])
};

/*
coords: [Y,X]

         3
        /
    Z  2
      /
     1
    /    X
  0----1----2----3
  |
  1
Y |
  2
  |
  3


  Y
X 0 1 2
  1
  2

  00, 01, 02
  10, 11, 12,
  20, 21, 22

*/
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

  const _refs = {
    stage: _options.block_render
      ? document.querySelector(query)
      : createStage(),
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
    // fireCustomEvent(_refs.stage, gridEventsEnum.STATE_UPDATED, _state);
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

  function finishMove(potentialCoords, event) {
    let progress = true;

    // LIMIT TESTING
    // Y) out of bounds? ---> can wrap? ---> set to end Y
    //                                  no-> stay at active_coords
    // X) out of bounds? ---> can wrap? ---> set to end X
    //                                  no-> stay at active_coords
    if (potentialCoords[0] < 0 || potentialCoords[0] >= _matrix[0].length) {
      if (_options.infinite_y) {
        if (event.which === 38) {
          potentialCoords[0] = _matrix[0].length - 1;
        } else {
          potentialCoords[0] = 0;
        }
        fireCustomEvent(_refs.stage, gridEventsEnum.ROW_WRAP, _state);
      } else {
        progress = false;
        potentialCoords = _state.active_coords;
        fireCustomEvent(_refs.stage, gridEventsEnum.ROW_LIMIT, _state);
      }
    }
    if (potentialCoords[1] < 0 || potentialCoords[1] >= _matrix[1].length) {
      if (_options.infinite_x) {
        if (event.which === 37) {
          potentialCoords[1] = _matrix[1].length - 1;
        } else {
          potentialCoords[1] = 0;
        }
        fireCustomEvent(_refs.stage, gridEventsEnum.COL_WRAP, _state);
      } else {
        progress = false;
        potentialCoords = _state.active_coords;
        fireCustomEvent(_refs.stage, gridEventsEnum.COL_LIMIT, _state);
      }
    }

    const type = _matrix[potentialCoords[0]][potentialCoords[1]].type;
    // Barrier or Interactive
    if (type === tileTypeEnum.BARRIER) {
      fireCustomEvent(_refs.stage, gridEventsEnum.POINT_BLOCK, _state);
      progress = false;
    } else {
      if (type === tileTypeEnum.INTERACTIVE) {
        fireCustomEvent(_refs.stage, gridEventsEnum.POINT_COLLIDE, _state);
      }
    }

    // Update the state
    if (progress) {
      setState({
        active_coords: [..._state.active_coords],
        prev_coords: _state.active_coords,
      });
    } else {
      setState({
        active_coords: potentialCoords,
        prev_coords: _state.active_coords,
      });
    }
  }

  function moveLeft(event) {
    fireCustomEvent(_refs.stage, gridEventsEnum.MOVE_LEFT, _state);
    const potentialCoords = [
      _state.active_coords[0],
      _state.active_coords[1] - 1,
    ];
    finishMove(potentialCoords, event);
  }

  function moveUp(event) {
    fireCustomEvent(_refs.stage, gridEventsEnum.MOVE_UP, _state);
    const potentialCoords = [
      _state.active_coords[0] - 1,
      _state.active_coords[1],
    ];
    finishMove(potentialCoords, event);
  }

  function moveRight(event) {
    fireCustomEvent(_refs.stage, gridEventsEnum.MOVE_RIGHT, _state);
    const potentialCoords = [
      _state.active_coords[0],
      _state.active_coords[1] + 1,
    ];
    finishMove(potentialCoords, event);
  }

  function moveDown(event) {
    fireCustomEvent(_refs.stage, gridEventsEnum.MOVE_DOWN, _state);
    const potentialCoords = [
      _state.active_coords[0] + 1,
      _state.active_coords[1],
    ];
    finishMove(potentialCoords, event);
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
    console.log(event);
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

      _refs.root.appendChild(_refs.stage);
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
