(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.GameGrid = {}));
})(this, (function (exports) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */


    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z = ".gamegrid * {\n  box-sizing: border-box;\n}\n.gamegrid__stage {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  flex-wrap: wrap;\n  box-sizing: border-box;\n  border: 1px solid;\n}\n.gamegrid__row {\n  display: flex;\n  flex-basis: 100%;\n  max-width: 100%;\n  box-sizing: border-box;\n}\n.gamegrid__cell {\n  flex: 1 0 auto;\n  height: auto;\n  overflow: hidden;\n  box-sizing: border-box;\n  border: 1px solid;\n}\n.gamegrid__cell--active {\n  outline: 4px solid red;\n}\n.gamegrid__cell::before {\n  content: \"\";\n  float: left;\n  padding-top: 100%;\n}";
    styleInject(css_248z);

    const gridEventsEnum = {
      RENDERED: "gamegrid:grid:rendered",
      STATE_UPDATED: "gamegrid:state:updated",

      MOVE_LEFT: "gamegrid:move:left",
      MOVE_RIGHT: "gamegrid:move:right",
      MOVE_UP: "gamegrid:move:up",
      MOVE_DOWN: "gamegrid:move:down",

      MOVE_BLOCKED: "gamegrid:move:blocked", // hits a wall
      MOVE_COLLISION: "gamegrid:move:collide", // overlaps another entity
      MOVE_DETTACH: "gamegrid:move:dettach", // leaves overlapping an entity
      MOVE_LAND: "gamegrid:move:land", // move finished

      LIMIT: "gamegrid:move:limit",
      LIMIT_X: "gamegrid:move:limit:x",
      LIMIT_Y: "gamegrid:move:limit:y",

      WRAP: "gamegrid:move:wrap",
      WRAP_X: "gamegrid:move:wrap:x",
      WRAP_Y: "gamegrid:move:wrap:y",
    };

    function getKeyByValue(object, value) {
        return Object.keys(object).find(function (key) { return object[key] === value; });
    }
    function renderAttributes(el, tuples) {
        tuples.forEach(function (tuple) {
            var _a;
            if (tuple[0] === "class") {
                (_a = el.classList).add.apply(_a, tuple[1].split(" "));
            }
            else {
                el.setAttribute(tuple[0], tuple[1]);
            }
        });
    }
    function fireCustomEvent(eventName, data) {
        window.dispatchEvent(new CustomEvent(eventName, {
            detail: __assign(__assign({}, data), { game_grid_instance: this }),
            bubbles: true,
        }));
        if (this.options.callbacks) {
            this.options.callbacks[getKeyByValue(gridEventsEnum, eventName)]
                ? this.options.callbacks[getKeyByValue(gridEventsEnum, eventName)](this)
                : null;
        }
    }

    var INITIAL_STATE = {
        active_coords: [0, 0],
        prev_coords: [0, 0],
        current_direction: "",
        rendered: false,
        moves: [[0, 0]],
    };
    var DIRECTIONS = {
        UP: "up",
        DOWN: "down",
        LEFT: "left",
        RIGHT: "right",
    };
    var HtmlGameGrid = /** @class */ (function () {
        function HtmlGameGrid(query, config) {
            this.options = __assign({ active_class: "gamegrid__cell--active", arrow_controls: true, wasd_controls: true, infinite_x: true, infinite_y: true, clickable: true, rewind_limit: 20, block_on_type: ["barrier"], collide_on_type: ["interactive"], move_on_type: ["open"] }, config.options);
            this.refs = {
                container: document.querySelector(query),
                rows: [],
                cells: [],
            };
            this.matrix = config.matrix;
            this.state = __assign(__assign({}, INITIAL_STATE), config.state);
            this.containerFocus = this.containerFocus.bind(this);
            this.containerBlur = this.containerBlur.bind(this);
            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleCellClick = this.handleCellClick.bind(this);
            this.render = this.render.bind(this);
            this.attachHandlers = this.attachHandlers.bind(this);
        }
        // API
        HtmlGameGrid.prototype.getOptions = function () {
            return this.options;
        };
        HtmlGameGrid.prototype.setOptions = function (newOptions) {
            this.options = __assign(__assign({}, this.options), newOptions);
        };
        HtmlGameGrid.prototype.getRefs = function () {
            return this.refs;
        };
        HtmlGameGrid.prototype.destroy = function () {
            this.state.rendered ? this.dettachHandlers() : null;
            this.refs = __assign(__assign({}, this.refs), { rows: [], cells: [] });
        };
        HtmlGameGrid.prototype.getState = function () {
            return this.state;
        };
        HtmlGameGrid.prototype.moveLeft = function () {
            this.setStateSync({
                next_coords: [
                    this.state.active_coords[0],
                    this.state.active_coords[1] - 1,
                ],
                current_direction: DIRECTIONS.LEFT,
            });
            fireCustomEvent.call(this, gridEventsEnum.MOVE_LEFT);
            this.finishMove();
        };
        HtmlGameGrid.prototype.moveUp = function () {
            this.setStateSync({
                next_coords: [
                    this.state.active_coords[0] - 1,
                    this.state.active_coords[1],
                ],
                current_direction: DIRECTIONS.UP,
            });
            fireCustomEvent.call(this, gridEventsEnum.MOVE_UP);
            this.finishMove();
        };
        HtmlGameGrid.prototype.moveRight = function () {
            this.setStateSync({
                next_coords: [
                    this.state.active_coords[0],
                    this.state.active_coords[1] + 1,
                ],
                current_direction: DIRECTIONS.RIGHT,
            });
            fireCustomEvent.call(this, gridEventsEnum.MOVE_RIGHT);
            this.finishMove();
        };
        HtmlGameGrid.prototype.moveDown = function () {
            this.setStateSync({
                next_coords: [
                    this.state.active_coords[0] + 1,
                    this.state.active_coords[1],
                ],
                current_direction: DIRECTIONS.DOWN,
            });
            fireCustomEvent.call(this, gridEventsEnum.MOVE_DOWN);
            this.finishMove();
        };
        HtmlGameGrid.prototype.setMatrix = function (m) {
            this.matrix = m;
        };
        HtmlGameGrid.prototype.getMatrix = function () {
            return this.matrix;
        };
        HtmlGameGrid.prototype.setStateSync = function (obj) {
            var newState = __assign(__assign({}, this.state), obj);
            this.state = newState;
            fireCustomEvent.call(this, gridEventsEnum.STATE_UPDATED);
        };
        HtmlGameGrid.prototype.render = function () {
            var _this = this;
            this.refs.container.classList.add("gamegrid");
            this.refs.container.setAttribute("tabindex", "0");
            this.refs.container.setAttribute("data-gamegrid-ref", "container");
            var grid = document.createDocumentFragment();
            this.matrix.forEach(function (rowData, rI) {
                var row = document.createElement("div");
                _this.options.row_class ? row.classList.add(_this.options.row_class) : null;
                row.setAttribute("data-gamegrid-row-index", rI.toString());
                row.setAttribute("data-gamegrid-ref", "row");
                row.classList.add("gamegrid__row");
                _this.refs.cells.push([]);
                rowData.forEach(function (cellData, cI) {
                    var _a;
                    var cell = document.createElement("div");
                    renderAttributes(cell, [
                        ["data-gamegrid-ref", "cell"],
                        ["data-gamegrid-row-index", rI.toString()],
                        ["data-gamegrid-col-index", cI.toString()],
                        ["data-gamegrid-coords", "".concat(rI, ",").concat(cI)],
                    ]);
                    cell.style.width = "".concat(100 / rowData.length, "%");
                    (_a = cellData.cellAttributes) === null || _a === void 0 ? void 0 : _a.forEach(function (attr) {
                        cell.setAttribute(attr[0], attr[1]);
                    });
                    cell.classList.add("gamegrid__cell");
                    cell.setAttribute("tabindex", _this.options.clickable ? "0" : "-1");
                    if (cellData.renderFunction) {
                        cell.appendChild(cellData.renderFunction());
                    }
                    row.appendChild(cell);
                    _this.refs.cells[rI].push(cell);
                });
                _this.refs.rows.push(row);
                grid.appendChild(row);
            });
            this.refs.container.appendChild(grid);
            this.setStateSync({ rendered: true });
            this.attachHandlers();
            fireCustomEvent.call(this, gridEventsEnum.RENDERED);
        };
        HtmlGameGrid.prototype.setFocusToCell = function (row, col) {
            var _a, _b;
            var cells = this.getRefs().cells;
            if (typeof row === "number" && typeof col === "number") {
                cells[row][col].focus();
                this.removeActiveClasses();
                cells[row][col].classList.add("gamegrid__cell--active");
                this.setStateSync({ active_coords: [row, col] });
            }
            else {
                (_a = this.getActiveCell()) === null || _a === void 0 ? void 0 : _a.focus();
                this.removeActiveClasses();
                (_b = this.getActiveCell()) === null || _b === void 0 ? void 0 : _b.classList.add("gamegrid__cell--active");
            }
        };
        HtmlGameGrid.prototype.setFocusToContainer = function () {
            this.getRefs().container.focus();
        };
        HtmlGameGrid.prototype.getActiveCell = function () {
            return this.getRefs().cells[this.state.active_coords[0]][this.state.active_coords[1]];
        };
        HtmlGameGrid.prototype.removeActiveClasses = function () {
            this.getRefs().cells.forEach(function (cellRow) {
                cellRow.forEach(function (cell) {
                    cell.classList.remove("gamegrid__cell--active");
                });
            });
        };
        HtmlGameGrid.prototype.addToMoves = function () {
            var clonedMoves = __spreadArray([], this.getState().moves, true);
            clonedMoves.unshift(this.state.active_coords);
            if (clonedMoves.length > this.options.rewind_limit) {
                clonedMoves.shift();
            }
            this.setStateSync({ moves: clonedMoves });
        };
        HtmlGameGrid.prototype.testLimit = function () {
            // use state direction, and state active coords
            var row = this.state.next_coords[0];
            var col = this.state.next_coords[1];
            var rowFinalIndex = this.matrix.length - 1;
            var colFinalIndex = this.matrix[this.state.active_coords[0]].length - 1; // todo: test for variable col length
            switch (this.state.current_direction) {
                case DIRECTIONS.DOWN:
                    if (this.state.next_coords[0] > rowFinalIndex) {
                        if (!this.options.infinite_y) {
                            row = rowFinalIndex;
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT_Y);
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT);
                        }
                        else {
                            row = 0;
                            fireCustomEvent.call(this, gridEventsEnum.WRAP_Y);
                            fireCustomEvent.call(this, gridEventsEnum.WRAP);
                        }
                    }
                    break;
                case DIRECTIONS.LEFT:
                    if (this.state.next_coords[1] < 0) {
                        if (this.options.infinite_x) {
                            col = colFinalIndex;
                            fireCustomEvent.call(this, gridEventsEnum.WRAP_X);
                            fireCustomEvent.call(this, gridEventsEnum.WRAP);
                        }
                        else {
                            col = 0;
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT_X);
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT);
                        }
                    }
                    break;
                case DIRECTIONS.RIGHT:
                    if (this.state.next_coords[1] > colFinalIndex) {
                        if (!this.options.infinite_x) {
                            col = colFinalIndex;
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT_X);
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT);
                        }
                        else {
                            col = 0;
                            fireCustomEvent.call(this, gridEventsEnum.WRAP_X);
                            fireCustomEvent.call(this, gridEventsEnum.WRAP);
                        }
                    }
                    break;
                case DIRECTIONS.UP:
                    if (this.state.next_coords[0] < 0) {
                        if (this.options.infinite_y) {
                            row = rowFinalIndex;
                            fireCustomEvent.call(this, gridEventsEnum.WRAP_Y);
                            fireCustomEvent.call(this, gridEventsEnum.WRAP);
                        }
                        else {
                            row = 0;
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT_Y);
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT);
                        }
                    }
                    break;
            }
            this.setStateSync({
                next_coords: [row, col],
                active_coords: [row, col],
                prev_coords: this.state.active_coords,
            });
        };
        HtmlGameGrid.prototype.testInteractive = function () {
            var _a;
            var coords = this.state.next_coords;
            if (((_a = this.matrix[coords[0]][coords[1]]) === null || _a === void 0 ? void 0 : _a.type) === "interactive") {
                fireCustomEvent.call(this, gridEventsEnum.MOVE_COLLISION);
            }
        };
        HtmlGameGrid.prototype.testBarrier = function () {
            var _a;
            var coords = this.state.next_coords;
            if (((_a = this.matrix[coords[0]][coords[1]]) === null || _a === void 0 ? void 0 : _a.type) === "barrier") {
                this.setStateSync({
                    active_coords: this.state.prev_coords,
                    prev_coords: this.state.active_coords,
                });
                fireCustomEvent.call(this, gridEventsEnum.MOVE_BLOCKED);
            }
        };
        HtmlGameGrid.prototype.testSpace = function () {
            var _a;
            var coords = this.state.next_coords;
            if (((_a = this.matrix[coords[0]][coords[1]]) === null || _a === void 0 ? void 0 : _a.type) === "open") {
                if (this.matrix[this.state.prev_coords[0]][this.state.prev_coords[1]]
                    .type === "interactive") {
                    fireCustomEvent.call(this, gridEventsEnum.MOVE_DETTACH);
                }
                fireCustomEvent.call(this, gridEventsEnum.MOVE_LAND);
            }
        };
        HtmlGameGrid.prototype.finishMove = function () {
            this.testLimit();
            this.testSpace();
            this.testInteractive();
            this.testBarrier();
            this.state.rendered ? this.setFocusToCell() : null;
            this.addToMoves();
        };
        HtmlGameGrid.prototype.handleDirection = function (event) {
            switch (event.code) {
                case "ArrowLeft": {
                    //left
                    this.moveLeft();
                    break;
                }
                case "KeyA": {
                    //left
                    this.moveLeft();
                    break;
                }
                case "ArrowUp": {
                    //up
                    this.moveUp();
                    break;
                }
                case "KeyW": {
                    //up
                    this.moveUp();
                    break;
                }
                case "ArrowRight": {
                    //right
                    this.moveRight();
                    break;
                }
                case "KeyD": {
                    //right
                    this.moveRight();
                    break;
                }
                case "ArrowDown": {
                    //down
                    this.moveDown();
                    break;
                }
                case "KeyS": {
                    //down
                    this.moveDown();
                    break;
                }
            }
        };
        HtmlGameGrid.prototype.handleKeyDown = function (event) {
            if (this.options.arrow_controls) {
                if (event.code === "ArrowUp" ||
                    event.code === "ArrowRight" ||
                    event.code === "ArrowDown" ||
                    event.code === "ArrowLeft") {
                    event.preventDefault();
                    this.handleDirection(event);
                }
            }
            if (this.options.wasd_controls) {
                if (event.code === "KeyW" ||
                    event.code === "KeyD" ||
                    event.code === "KeyS" ||
                    event.code === "KeyA") {
                    event.preventDefault();
                    this.handleDirection(event);
                }
            }
        };
        HtmlGameGrid.prototype.handleCellClick = function (event) {
            if (this.getOptions().clickable) {
                if (event.target instanceof HTMLElement) {
                    var cellEl = event.target.closest('[data-gamegrid-ref="cell"]');
                    if (cellEl) {
                        var coords = cellEl
                            .getAttribute("data-gamegrid-coords")
                            .split(",")
                            .map(function (n) { return Number(n); });
                        this.setFocusToCell.apply(this, coords);
                    }
                    else {
                        this.setFocusToCell();
                    }
                }
            }
        };
        HtmlGameGrid.prototype.containerFocus = function () {
            this.getRefs().container.classList.add(this.options.active_class);
        };
        HtmlGameGrid.prototype.containerBlur = function () {
            this.getRefs().container.classList.remove(this.options.active_class);
        };
        // SET UP
        HtmlGameGrid.prototype.attachHandlers = function () {
            this.getRefs().container.addEventListener("keydown", this.handleKeyDown);
            this.getRefs().container.addEventListener("focus", this.containerFocus);
            this.getRefs().container.addEventListener("blur", this.containerBlur);
            this.getRefs().container.addEventListener("click", this.handleCellClick);
        };
        HtmlGameGrid.prototype.dettachHandlers = function () {
            this.getRefs().container.removeEventListener("keydown", this.handleKeyDown);
            this.getRefs().container.removeEventListener("focus", this.containerFocus);
            this.getRefs().container.removeEventListener("blur", this.containerBlur);
            this.getRefs().container.removeEventListener("click", this.handleCellClick);
        };
        return HtmlGameGrid;
    }());
    var gameGridEventsEnum = gridEventsEnum;

    exports.default = HtmlGameGrid;
    exports.gameGridEventsEnum = gameGridEventsEnum;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
