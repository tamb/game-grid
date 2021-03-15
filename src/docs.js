/**
 * @file Describes the exposed API and configuration for [GameGrid]{@link GameGrid}
 */

/**
 * @typedef GameGridInstance
 * @type {object}
 * @property {function} render - render the HTML for the GameGrid.
 * @property {function} destroy - removes all EventListeners
 * @property {function} getConfig - returns Config object of GameGrid
 * @property {function} getRefs - returns internal _refs object
 * @property {function} getState - returns internal State
 *
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
 */

/**
 * @typedef Matrix
 * @type {Tile[][]}
 */

/**
 * @typedef Tile
 * @type {object}
 *
 * @property {string|number} key specific key of tile
 * @property {string} type type of tile "space", "barrier", "interactive"
 * @property {DataAttributes[]} [data] array of tuples for assigning data attributes
 * @property {function|string} renderString HTML string to render contents of tile
 * @property {HTMLObject} renderObject HTML created with document.createElement as
 *
 */

/**
 * @typedef DataAttributes
 * @type {string[]}
 *
 *
 */

/**
 * @typedef Refs
 * @type {object}
 * @property {HTMLDivElement} stage - containing div of grid
 * @property {HTMLDivElement[]} rows - ordered list of divs containing row of Tiles
 * @property {HTMLDivElement[][]} tiles - 2-dimensional array of divs, which are your tiles
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
