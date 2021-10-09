# gamegrid
** A 2D HTML Grid for creating web games **

## Goals of this project
* Create a 2D grid in memory capable of handling coordinates and interactions
* Define a set of interactions that are baked in and allow for augmentation
* Optional rendering for the physical grid.
* Optional TypeScript support

## The GameGrid class
`GameGrid` is a class that you instantiate to create a 2D grid in memory, with optional rendering of the grid.
```js
const grid = new GameGrid(query: string, config: IConfig): GameGridInstance;
```
* `query` {string} - the DOMString used to select the grid container.  
* `config` {object} - configuration for GameGrid

## `config`
The `config` argument has the follow fields:
* `options`
* `matrix`
* `state`