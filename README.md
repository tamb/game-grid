# GameGrid

__A 2D HTML Grid for Creating Web Games__
<br/>
<small>or other things that could use a 2D Matrix</small>

## Goals of this project

- Create a 2D grid in memory capable of handling coordinates and interactions
- Define a set of interactions that are baked in and allow for augmentation
- Optional rendering for the physical grid.
- TypeScript support
- Have fun with it!

## The GameGrid class

`GameGrid` is a class that you instantiate to create a 2D grid in memory, with optional rendering of the grid.

```ts
// All code examples are written in Typescript

const grid : GameGrid = new GameGrid(config: IConfig, element: HTMLElement);
```

## `config : IConfig`

The `config` argument has the follow fields:

- `options : IOptions`
- `matrix : IMatrix`
- `state : IState`

### `options : IOptions`
```ts
interface IOptions {

}
```

### `matrix : ICell[][]`

The Matrix is a great movie. It's also a 2D representation of the game grid you're making.

- `ICell[][]`

#### `cell : ICell`

Cells have the following properties

- `renderFunction : Function` returns the HTML that will be rendered in that particular cell.
- `cellAttributes: string[][]` - An Array of Tuples for attributes to render on the cells HTML. ie: `[["data-foo", "bar"]]`
- `type : string ("interactive", "open", "barrier")` - this determines the type of cell to render, which in turns determines how the active cell will react.
- `[key : string] : any` - you can add any additional data to the cell you will be able to access it through the matrix and helper methods.

### `state : IState`

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

- `getOptions() : options`
- `setOptions(newOptions : options) : void`
- `getRefs() : refs`
- `destroy() : void`
- `getState() : state`
- `moveLeft() : void`
- `moveRight() : void`
- `moveUp() : void`
- `moveDown() : void`
- `setMatrix(cell[][]) : void`
- `getMatrix() : matrix`
- `setStateSync(state) : void`
- `render() : void`
- `getActiveCell() : cell`

## Events

GameGrid emits the following custom events. Each one corresponds with the `callbacks`.  
Each event has a `detail` object with the `game_grid_instance` containing all of the above.

- `gamegrid:grid:rendered`
- `gamegrid:state:updated`
- `gamegrid:move:left`
- `gamegrid:move:right`
- `gamegrid:move:up`
- `gamegrid:move:down`
- `gamegrid:move:blocked`
- `gamegrid:move:collide`
- `gamegrid:move:dettach`
- `gamegrid:move:land`
- `gamegrid:limit`
- `gamegrid:limit:x`
- `gamegrid:limit:y`
- `gamegrid:wrap`
- `gamegrid:wrap:x`
- `gamegrid:wrap:y`

## Instantiation

```js
import GameGrid from "@tamb/gamegrid";

const config = // my config settings

const gg = new GameGrid("#grid-container", config);

// optionally render the grid
gg.render();

// create moves like so
gg.moveLeft();
gg.moveRight();
```
