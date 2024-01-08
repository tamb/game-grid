# GameGrid

**A 2D HTML Grid for Creating Web Games**
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

```ts
export interface IConfig {
  options?: IOptions;
  matrix: ICell[][];
  state?: IState;
}
```

### `options : IOptions`

```ts
export interface IOptions {
  id?: string;
  arrowControls?: boolean;
  wasdControls?: boolean;
  infiniteX?: boolean;
  infiniteY?: boolean;
  clickable?: boolean;
  rewindLimit?: number;
  middlewares?: {
    pre: ((gamegridInstance: IGameGrid, newState: any) => void)[];
    post: ((gamegridInstance: IGameGrid, newState: any) => void)[];
  };

  // TODO: Utilize these options to add additional supported cell types
  blockOnType?: string[];
  collideOnType?: string[];
  moveOnType?: string[];

  // TODO: Add support for this
  // render options
  activeClass?: string;
  containerClass?: string;
  rowClass?: string;
}
```

### `matrix : ICell[][]`

The Matrix is a great movie. It's also a 2D representation of the game grid you're making.

- `ICell[][]`

#### `cell : ICell`

The Cell is a really inferior movie.\* It's also an object representing a single point in the grid.

### `state : IState`

The State is a really funny TV show. It's also an object representing the current state of the grid.

```ts
export interface IState {
  activeCoords: number[];
  prevCoords: number[];
  nextCoords: number[];
  moves: number[][];
  currentDirection?: string;
  rendered?: boolean;
}
```

State has to have preceeding attributes to be valid. But when you `setStateSync` you can add whatever else you want. You can also do a partial state update and it will work.

#### State Middleware

## pre

The `pre` middleware is called everytime before the state is updated. It receives the `gamegridInstance` and the `newState` as arguments. You can modify the `newState` object and it will be used to update the state. You can also access the `gamegridInstance` to get the current state.
These functions execute in the order in which they are registered.

## post

The `post` middleware is called everytime after the state is updated. It receives the `gamegridInstance` and the `newState` as arguments. These functions execute in the order in which they are registered.

## Refs

Refs are... I'm not gonna continue with the bit.
<br/>
The GameGrid instance has a `refs` object that contains references to the optional HTML elements of the grid

```ts
export interface IRefs {
  container: HTMLElement | null;
  rows: HTMLDivElement[];
  cells: HTMLDivElement[][];
}
```

## GameGrid Instance

```
export interface IGameGrid {
  refs: IRefs;
  options: IOptions;
  root?: HTMLElement;

  renderGrid(container: HTMLElement): void;
  getOptions(): IOptions;
  setOptions(newOptions: IOptions): void;
  destroy(): void;
  getState(): IState;
  moveLeft(): void;
  moveUp(): void;
  moveRight(): void;
  moveDown(): void;
  setMatrix(m: ICell[][]): void;
  getMatrix(): ICell[][];
  setStateSync(obj: IState): void;
  getActiveCell(): HTMLDivElement;
}
```

## Events

GameGrid emits the following custom events. Each one corresponds with the `callbacks`.  
Each event has a `detail` object with the `game_grid_instance` containing all of the above.

- `gamegrid:grid:rendered`
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
