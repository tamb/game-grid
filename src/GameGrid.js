import {
  renderDataAttributes,
  getCoordsFromElement,
  fireCustomEvent,
} from "./utils";

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
  let _prev_state = config.prev_state || {};

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
    _prevState = _state;
    _state = newState;
  }

  function getActiveTile() {
    return _refs.tiles[_state.active_coords[0]][_state.active_coords[1]];
  }

  function setActiveTileByElement(el) {
    setState({
      active_coords: getCoordsFromElement(el),
      prev_coords: _state.active_coords,
    });
    //   renderTileAsActive();
  }
  function setActiveTileByRowCol(row, col) {
    setState({ active_coords: [row, col], prev_coords: _state.active_coords });
    //   renderTileAsActive();
  }

  //INPUT
  function addToMoves() {
    _state.moves.unshift(_state.active_coords);
    if (_state.moves.length > _config.rewind_limit) {
      _state.moves.pop();
    }
  }

  function hitsBarrier(el) {
    const coords = getCoordsFromElement(el);
    const tileData = _config.matrix[coords[0]][coords[1]];
    const _el = _refs.tiles[coords[0]][coords[1]];
    const isBarrier = tileData.type === "barrier";
    if (isBarrier) {
      fireCustomEvent(_el, gridEventsEnum.POINT_BLOCK);
    }

    return isBarrier;
  }

  function hitsInteractive(el) {
    const coords = getCoordsFromElement(el);
    const tileData = _config.matrix[coords[0]][coords[1]];
    const _el = _refs.tiles[coords[0]][coords[1]];
    const isInteractive = tileData.type === "interactive";
    if (isInteractive) {
      fireCustomEvent(_el, gridEventsEnum.POINT_COLLIDE);
    }

    return isInteractive;
  }

  function handleDirection(event) {
    const ENDROW = _config.matrix.length - 1;
    const ENDCOL = _config.matrix[0].length - 1;

    const currentEl = event.target;
    const coords = getCoordsFromElement(currentEl);

    let directionMoved = null;

    if (event.which === 37 || event.key === "ArrowLeft") {
      fireCustomEvent(currentEl, gridEventsEnum.MOVE_LEFT);
      directionMoved = gridEventsEnum.MOVED_LEFT;

      if (coords[1] - 1 < 0) {
        if (!_config.infinite_x) {
          fireCustomEvent(getActiveTile(), gridEventsEnum.COL_LIMIT);
          return;
        }
        setState({
          active_coords: [coords[0], ENDCOL],
          prev_coords: _state.active_coords,
        });
        fireCustomEvent(getActiveTile(), gridEventsEnum.COL_WRAP);
      } else {
        setState({
          active_coords: [coords[0]][coords[1] - 1],
          prev_coords: _state.active_coords,
        });
      }
    }
    if (event.which === 38 || event.key === "ArrowUp") {
      fireCustomEvent(currentEl, gridEventsEnum.MOVE_UP);
      directionMoved = gridEventsEnum.MOVED_UP;
      if (coords[0] - 1 < 0) {
        if (!_config.infinite_y) {
          fireCustomEvent(currentEl, gridEventsEnum.ROW_LIMIT);
          return;
        }
        fireCustomEvent(currentEl, gridEventsEnum.ROW_WRAP);
        nextEl = TILES[ENDROW][coords[1]];
      } else {
        nextEl = TILES[coords[0] - 1][coords[1]];
      }
    }
    if (event.which === 39 || event.key === "ArrowRight") {
      fireCustomEvent(currentEl, gridEventsEnum.MOVE_RIGHT);
      directionMoved = gridEventsEnum.MOVED_RIGHT;
      if (coords[1] + 1 > ENDCOL) {
        if (!_config.infinite_x) {
          fireCustomEvent(currentEl, gridEventsEnum.COL_LIMIT);
          return;
        }
        fireCustomEvent(currentEl, gridEventsEnum.COL_WRAP);
        nextEl = TILES[coords[0]][0];
      } else {
        nextEl = TILES[coords[0]][coords[1] + 1];
      }
    }

    if (event.which === 40 || event.key === "ArrowDown") {
      fireCustomEvent(currentEl, gridEventsEnum.MOVE_DOWN);
      directionMoved = gridEventsEnum.MOVED_DOWN;
      if (coords[0] + 1 > ENDROW) {
        if (!_config.infinite_y) {
          fireCustomEvent(currentEl, gridEventsEnum.ROW_LIMIT);
          return;
        }
        nextEl = TILES[0][coords[1]];
        fireCustomEvent(currentEl, gridEventsEnum.ROW_WRAP);
      } else {
        nextEl = TILES[coords[0] + 1][coords[1]];
      }
    }

    checkSurroundings(nextEl, directionMoved, currentEl);
  }
  function handleKeyDown(event) {
    // console.log(event);
    event.preventDefault();

    if (_config.arrow_controls) {
      if (
        event.which === 37 ||
        event.which === 38 ||
        event.which === 39 ||
        event.which === 40
      ) {
        handleDirection(event);
      }
    }
  }

  function checkSurroundings(nextEl, directionMoved, currentEl) {
    const hitBarrier = hitsBarrier(nextEl);
    const hitInteractive = hitsInteractive(nextEl);

    if (!hitInteractive) {
      const oldCoords = getCoordsFromElement(
        _refs.prev_element ? _refs.prev_element : _refs.active_element
      ); // should be from state
      if (_config.matrix[oldCoords[0]][oldCoords[1]].type === "interactive") {
        fireCustomEvent(nextEl, gridEventsEnum.POINT_DETTACH);
      }
    }

    if (hitBarrier) {
      nextEl = getActiveEl() || currentEl;
    }
    setActiveTileByElement(nextEl);
    !hitBarrier ? fireCustomEvent(currentEl, directionMoved) : null;
  }

  // SET UP
  function attachHandlers() {
    _refs.tiles.forEach((row) => {
      row.forEach((tile) => {
        tile.addEventListener("keydown", handleKeyDown);
      });
    });
  }
  function dettachHandlers() {
    _refs.tiles.forEach((row) => {
      row.forEach((tile) => {
        tile.removeEventListener("keydown", handleKeyDown);
      });
    });
  }

  // RENDERER
  function createStage() {
    const stage = document.createElement("div");
    stage.tabIndex = "0";
    stage.classList.add("GameGrid__stage");

    return stage;
  }
  function renderTileAsActive() {
    _refs.prev_element
      ? fireCustomEvent(_refs.prev_element, gridEventsEnum.TILE_BLUR)
      : null;
    _refs.active_element.focus();
    fireCustomEvent(_refs.active_element, gridEventsEnum.TILE_FOCUS);
    _refs.prev_element?.classList.remove("active");
    _refs.active_element.classList.add("active");
    addToMoves();
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
      newTile.tabIndex = "-1";
      newTile.style.maxWidth = `${100 / _row.length}%`;
      newTile.setAttribute("data-coords", `${_rowIndex},${_tileIndex}`);
      _tile.key ? newTile.setAttribute("data-key", _tile.key) : null;
      _tile.data ? renderDataAttributes(newTile, _tile.data) : null;
      newTile.setAttribute("data-type", _tile.type);

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
    renderRows(_config.matrix);

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
    if (_config.arrow_controls) {
      attachHandlers();
    }
    fireCustomEvent(_refs.stage, gridEventsEnum.STAGE_RENDER);

    setActiveTileByRowCol(..._state.active_coords);
  }

  return {
    destroy,
    render,
    getConfig,
    getPrevEl,
    getActiveEl,
    getTiles,
    getRows,
    getStage,
    setActiveTileByElement,
    getState,
    getPrevState,
    getMoves,
    getRefs,

    setActiveTileByRowCol,
    setConfig,
    setState,

    // TODO
    // getGridData - should return the _state of
    // of the grid so it can be rendered as it was last left
    // need to add a way to track the grid data as _state
  };
}

export default GameGrid;
