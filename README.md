# gamegrid

** A 2D HTML Grid for creating web games **

## Goals of this project

- Create a 2D grid in memory capable of handling coordinates and interactions
- Define a set of interactions that are baked in and allow for augmentation
- Optional rendering for the physical grid.
- Optional TypeScript support

## The GameGrid class

`GameGrid` is a class that you instantiate to create a 2D grid in memory, with optional rendering of the grid.

```js
const grid = new GameGrid(query: string, config: IConfig): GameGridInstance;
```

- `query` {string} - the DOMString used to select the grid container.
- `config` {object} - configuration for GameGrid

## `config`

The `config` argument has the follow fields:

- `options`
- `matrix`
- `state`

### `options`

- `arrow_controls=true : boolean`
- `wasd_controls=false : boolean`
- `infinite_x=true : boolean`
- `infinite_y=true : boolean`
- `clickable=true : boolean`
- `rewind_limit=20 : number`
- `callbacks={} : object`
- `block_on_type` - coming soon
- `collide_on_type` - coming soon
- `move_on_type` - coming soon
- `active_class` - coming soon
- `container_class` - coming soon
- `row_class` - coming soon

#### `callbacks`

These are callbacks you can define to fire at certain parts of the `gamegrid` lifecycle. Assign your functions to following keys...

- `STATE_UPDATED`
- `MOVE_LEFT`
- `MOVE_RIGHT`
- `MOVE_UP`
- `MOVE_DOWN`
- `MOVE_BLOCKED`
- `MOVE_COLLISION`
- `MOVE_DETTACH`
- `MOVE_LAND`
- `LIMIT`
- `LIMIT_X`
- `LIMIT_Y`
- `WRAP`
- `WRAP_X`
- `WRAP_Y`

### `matrix`

The Matrix is a great movie. It's also a 2D representation of the game grid you're making.

- `Cell[][]`

#### `Cell`

Cells have the following properties

- `renderFunction : Function` returns the HTML that will be rendered in that particular cell.
- `cellAttributes: string[][]` - An Array of Tuples for attributes to render on the cells HTML. ie: `[["data-foo", "bar"]]`
- `type : string ("interactive", "open", "barrier")` - this determines the type of cell to render, which in turns determines how the active cell will react.
- `[key : string] : any` - you can add any additional data to the cell you will be able to access it through the matrix and helper methods.

### `state`

The `state` contains the following fields

- `active_coords`
- `prev_coords`
- `next_coords`
- `moves`
- `current_direction`
- `rendered`

## Refs

The GameGrid instance has a `refs` object that contains references to the HTML elements of the grid

- `container`
- `rows`
- `cells`

## Methods

The GameGrid instance has many methods that can be used to update the state of the grid
