import {
  renderDataAttributes,
  getCoordsFromElement,
  fireCustomEvent,
} from "./utils";

import { gridEventsEnum } from "./enums";

const INITIAL_STATE = {
  active_coords: [0, 0],
  prev_coords: [0, 0],
};

function GameGrid(query, conf) {
  const _config = {
    arrow_controls: true,
    disable_click: true,
    infinite_x: true,
    infinite_y: true,
    ...conf,
  };
  const _root = document.querySelector(query);
  const _refs = {
    stage: createStage(),
    rows: null,
    tiles: [],
    prev_element: null,
    active_element: null,
  };
  const _state = INITIAL_STATE;
  const _prevState = null;

  // API
  function destroy() {
    dettachHandlers();
  }
  function getConfig() {
    return _config;
  }
  function getPrevEl() {
    return _refs.prev_element;
  }

  function setState(obj) {
    const newState = { ..._state, ...obj };
    _prevState = _state;
    _state = newState;
  }

  function getState() {
    return _state;
  }

  function getPrevState() {
    return _prevState;
  }

  function getActiveEl() {
    return _refs.active_element;
  }
  function getStage() {
    return _refs.stage;
  }
  function getRows(id) {
    if (id) {
      return _refs.rows[id];
    } else {
      return _refs.rows;
    }
  }

  function getTiles(row, col) {
    if (row && col) {
      return _refs.tiles[row][col];
    } else {
      return _refs.tiles;
    }
  }

  function setActiveTileByElement(el) {
    renderTileAsActive(el);
  }
  function setActiveTileByRowCol(row, col) {
    renderTileAsActive(_refs.tiles[row][col]);
  }
  function setConfig(conf) {
    _config = conf;
  }

  //INPUT

  function hitsBarrier(el) {
    const coords = getCoordsFromElement(el);
    const barrierCheck = _config.matrix[coords[0]][coords[1]];
    const _el = _refs.tiles[coords[0]][coords[1]];
    const hitBarrier = barrierCheck.type === "barrier";
    if (hitBarrier) {
      fireCustomEvent(_el, gridEventsEnum.POINT_BLOCK);
    }

    return hitBarrier;
  }


  function hitsInteractive(el) {
    const coords = getCoordsFromElement(el);
    const interactiveCheck = _config.matrix[coords[0]][coords[1]];
    const _el = _refs.tiles[coords[0]][coords[1]];
    const isInteractive = interactiveCheck.type === "interactive";
    if (isInteractive) {
      fireCustomEvent(_el, gridEventsEnum.POINT_COLLIDE);
    }

    return isInteractive;
  }

  function handleDirection(event) {
    const ENDROW = _config.matrix.length - 1;
    const ENDCOL = _config.matrix[0].length - 1;
    const TILES = _refs.tiles;
    const currentEl = event.target;
    const coords = getCoordsFromElement(currentEl);

    let nextEl = null;
    let directionMoved = null;

    if (event.which === 37 || event.key === "ArrowLeft") {
      fireCustomEvent(currentEl, gridEventsEnum.MOVE_LEFT);
      directionMoved = gridEventsEnum.MOVED_LEFT;

      if (coords[1] - 1 < 0) {
        if (!_config.infinite_x) {
          fireCustomEvent(currentEl, gridEventsEnum.COL_LIMIT);
          return;
        }
        fireCustomEvent(currentEl, gridEventsEnum.COL_WRAP);
        nextEl = TILES[coords[0]][ENDCOL];
      } else {
        nextEl = TILES[coords[0]][coords[1] - 1];
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

    const hitBarrier = hitsBarrier(nextEl);
    const hitInteractive = hitsInteractive(nextEl);

    if(!hitInteractive){
      const oldCoords = getCoordsFromElement(_refs.prev_element); // should be from state
      if(_config.matrix[oldCoords[0]][oldCoords[1]].type === "interactive"){
        fireCustomEvent(nextEl, gridEventsEnum.POINT_DETTACH);
      }
    }

    if (hitBarrier) {
      nextEl = getActiveEl() || currentEl;
    }
    renderTileAsActive(nextEl);
    !hitBarrier ? fireCustomEvent(currentEl, directionMoved) : null;
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

  // SET UP
  function attachHandlers() {
    _refs.tiles.forEach((row) => {
      row.forEach((tile) => {
        _config.disable_click
          ? tile.addEventListener("click", (e) => e.preventDefault())
          : null;
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
  function renderTileAsActive(el) {
    _refs.prev_element
      ? fireCustomEvent(_refs.prev_element, gridEventsEnum.TILE_BLUR)
      : null;
    el.focus();
    fireCustomEvent(el, gridEventsEnum.TILE_FOCUS);
    _refs.prev_element = _refs.active_element;
    _refs.active_element = el;
    _refs.prev_element?.classList.remove("focused");
    _refs.active_element.classList.add("focused");
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
      newTile.tabIndex = "0";
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
    setActiveTileByRowCol,
    setConfig,
    setState,
    getState,
    getPrevState,

    // TODO
    // getGridData - should return the _state of
    // of the grid so it can be rendered as it was last left
    // need to add a way to track the grid data as _state
  };
}

export default GameGrid;
