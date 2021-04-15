/**
 * @file Describes the exposed API and configuration for [GameGridHtml]{@link GameGridHtml}
 */

/**
 * @typedef GameGridHtmlInstance
 * @type {object}
 * @property {function} render - render the HTML for the GameGrid.
 * @property {function} destroy - removes all EventListeners
 * @property {function} moveLeft - returns Config object of GameGrid
 * @property {function} moveRight - returns internal _refs object
 * @property {function} moveUp - returns internal _refs object
 * @property {function} moveDown - returns internal _refs object
 * @property {function} getState - returns internal State
 * @property {function} setMatrix - sets grid matrix data and values
 * @property {function} setStateSync - updates the internal state of the GameGridInstance in a synchronous manner
 * @property {setFocusToCell} setFocusToCell - focuses on specified cell give row and column respectively.  Defaults focus to active cell
 * @property {function} setFocusToContainer - sets focus to the gamegrid container
 *
 */

/**
 * @typedef setFocusToCell
 * @type {function}
 * @param {number} row
 * @param {number} cell
 */

/**
 * @typedef Config
 * @type {object}
 *
 *  @property {Options} [options] options object
 *  @property {Matrix} matrix matrix of tile data
 *  @property {State} [state] initial state object for the gamegrid
 *  @property {State} [prev_state] what the previous state should be set to.  defaults to empty object
 */

/**
 * @typedef State
 * @type {object}
 * @property {number[]} [active_coords=[0,0]] - y & x OR row & column of the tile that is active
 * @property {number[]} [prev_coords=[0,0]]  - y & x OR row & column of the tile that was previously active
 * @property {number[][]} [moves=[]] - record of all moves up to your rewind_limit
 * @property {Matrix[]} matrices - list of Matrix elements up to your rewind_limit
 *
 */

/**
 * @typedef Options
 * @type {object}
 *
 * @property {boolean} [infinite_x=true] - when moving columns the active tile will wrap when it hits edge
 * @property {boolean}  [infinite_y=true] - when moving rows the active tile will wrap when it hits the edge
 * @property {number} [rewind_limit=20] - maximum number of moves stored in state
 * @property {boolean} [square_tiles=true] - maintain all tiles as squares / sets max-width on tile elements
 * @property {boolean} [block_render=false] - if true, will not render anything and use query as listener
 */

/**
 * @typedef Matrix
 * @type {Tile[][]}
 */

/**
 * @typedef Tile
 * @type {object}
 *
 * @property {string} type type of tile "space", "barrier", "interactive"
 *
 */

/**
 * @author Tamb - tamb.github.io
 * @version 0.0.1
 * @function GameGrid
 * @param {string} query document.querySelector string
 * @param {Config} config GameGrid configurations
 *
 * @returns {GameGridInstance} GameGrid instance with API
 * @example
 *  const gameGrid = new GameGrid(root, config);
 */
