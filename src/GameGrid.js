import {
    renderDataAttributes,
    getCoordsFromElement,
    fireCustomEvent
  } from "./utils";
  
  import { gridEventsEnum } from "./enums";
  
  function GameGrid(query, conf) {
    const config = {
      arrowControls: true,
      disableClick: true,
      infiniteX: true,
      infiniteY: true,
      ...conf
    };
    const $root = document.querySelector(query);
  
    const $refs = {
      stage: createStage(),
      rows: null,
      tiles: []
    };
  
    let prevEl = null;
    let activeEl = null;
  
    // API
    function destroy() {
      dettachHandlers();
    }
    function getConfig() {
      return config;
    }
    function getPrevEl() {
      return prevEl;
    }
  
    function getActiveEl() {
      return activeEl;
    }
    function getStage() {
      return $refs.stage;
    }
    function getRows(id) {
      if (id) {
        return $refs.rows[id];
      } else {
        return $refs.rows;
      }
    }
  
    function getTiles(row, col) {
      if (row && col) {
        return $refs.tiles[row][col];
      } else {
        return $refs.tiles;
      }
    }
  
    function setActiveTileByElement(el) {
      renderTileAsActive(el);
    }
    function setActiveTileByRowCol(row, col) {
      renderTileAsActive($refs.tiles[row][col]);
    }
    function setConfig(conf) {
      config = conf;
    }
  
    //INPUT
  
    function hitsBarrier(el) {
      const coords = getCoordsFromElement(el);
      const barrierCheck = config.matrix[coords[0]][coords[1]];
      const _el = $refs.tiles[coords[0]][coords[1]];
      const hitBarrier = barrierCheck.type === "barrier";
      if (hitBarrier) {
        fireCustomEvent(_el, gridEventsEnum.POINT_BLOCK);
      }
  
      return hitBarrier;
    }
  
    function handleDirection(event) {
      const ENDROW = config.matrix.length - 1;
      const ENDCOL = config.matrix[0].length - 1;
      const TILES = $refs.tiles;
      const activeEl = event.target;
      const coords = getCoordsFromElement(activeEl);
  
      let nextEl = null;
      let directionMoved = null;
  
      if (event.which === 37 || event.key === "ArrowLeft") {
        fireCustomEvent(activeEl, gridEventsEnum.MOVE_LEFT);
        directionMoved = gridEventsEnum.MOVED_LEFT;
  
        if (coords[1] - 1 < 0) {
          if (!config.infiniteX) {
            fireCustomEvent(activeEl, gridEventsEnum.COL_LIMIT);
            return;
          }
          fireCustomEvent(activeEl, gridEventsEnum.COL_WRAP);
          nextEl = TILES[coords[0]][ENDCOL];
        } else {
          nextEl = TILES[coords[0]][coords[1] - 1];
        }
      }
      if (event.which === 38 || event.key === "ArrowUp") {
        fireCustomEvent(activeEl, gridEventsEnum.MOVE_UP);
        directionMoved = gridEventsEnum.MOVED_UP;
        if (coords[0] - 1 < 0) {
          if (!config.infiniteY) {
            fireCustomEvent(activeEl, gridEventsEnum.ROW_LIMIT);
            return;
          }
          fireCustomEvent(activeEl, gridEventsEnum.ROW_WRAP);
          nextEl = TILES[ENDROW][coords[1]];
        } else {
          nextEl = TILES[coords[0] - 1][coords[1]];
        }
      }
      if (event.which === 39 || event.key === "ArrowRight") {
        fireCustomEvent(activeEl, gridEventsEnum.MOVE_RIGHT);
        directionMoved = gridEventsEnum.MOVED_RIGHT;
        if (coords[1] + 1 > ENDCOL) {
          if (!config.infiniteX) {
            fireCustomEvent(activeEl, gridEventsEnum.COL_LIMIT);
            return;
          }
          fireCustomEvent(activeEl, gridEventsEnum.COL_WRAP);
          nextEl = TILES[coords[0]][0];
        } else {
          nextEl = TILES[coords[0]][coords[1] + 1];
        }
      }
  
      if (event.which === 40 || event.key === "ArrowDown") {
        fireCustomEvent(activeEl, gridEventsEnum.MOVE_DOWN);
        directionMoved = gridEventsEnum.MOVED_DOWN;
        if (coords[0] + 1 > ENDROW) {
          if (!config.infiniteY) {
            fireCustomEvent(activeEl, gridEventsEnum.ROW_LIMIT);
            return;
          }
          nextEl = TILES[0][coords[1]];
          fireCustomEvent(activeEl, gridEventsEnum.ROW_WRAP);
        } else {
          nextEl = TILES[coords[0] + 1][coords[1]];
        }
      }
  
      const hitBarrier = hitsBarrier(nextEl);
      if (hitBarrier) {
        nextEl = getActiveEl() || activeEl;
      }
      renderTileAsActive(nextEl);
      !hitBarrier? fireCustomEvent(activeEl, directionMoved) : null;
    }
    function handleError(err) {}
    function handleKeyDown(event) {
      // console.log(event);
      event.preventDefault();
  
      if (config.arrowControls) {
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
      $refs.tiles.forEach((row) => {
        row.forEach((tile) => {
          config.disableClick? tile.addEventListener("click", e=> e.preventDefault()) : null;
          tile.addEventListener("keydown", handleKeyDown);
        });
      });
    }
  
    function dettachHandlers() {
      $refs.tiles.forEach((row) => {
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
      prevEl ? fireCustomEvent(prevEl, gridEventsEnum.TILE_BLUR) : null;
      el.focus();
      fireCustomEvent(el, gridEventsEnum.TILE_FOCUS);
      prevEl = activeEl;
      activeEl = el;
      prevEl?.classList.remove("focused");
      activeEl.classList.add("focused");
    }
    function renderRows(_rows) {
      $refs.rows = _rows.map((_row, _rowIndex) => {
        renderTilesByRow(_row, _rowIndex);
        const newRow = document.createElement("div");
        newRow.classList.add("GameGrid__row");
        return newRow;
      });
    }
    function renderTilesByRow(_row, _rowIndex) {
      $refs.tiles[_rowIndex] = _row.map((_tile, _tileIndex) => {
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
      renderRows(config.matrix);
  
      $refs.rows.forEach((row, index) => {
        const frag = document.createDocumentFragment();
        $refs.tiles[index].forEach((tile) => {
          frag.appendChild(tile);
        });
        row.appendChild(frag);
        $refs.stage.appendChild(row);
        fireCustomEvent(row, gridEventsEnum.ROW_RENDER);
      });
  
      $root.appendChild($refs.stage);
      if (config.arrowControls) {
        attachHandlers();
      }
      fireCustomEvent($refs.stage, gridEventsEnum.STAGE_RENDER);
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
      setConfig
  
      // TODO
      // getGridData - should return the state of
      // of the grid so it can be rendered as it was last left
      // need to add a way to track the grid data as state
    };
  }
  
  export default GameGrid;
  