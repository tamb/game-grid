import GameGrid from './../../dist/main.js';
import { attachListeners } from './eventListeners.js';
import { matrix2 } from './matrices.js';
import { tileTypeEnum } from './enums.js';
import { renderMaze } from './maze.js';

const matrix = [
  [
    {
      type: tileTypeEnum.OPEN,
      cellAttributes: [
        ['data-butt', 'sauce'],
        ['class', 'butt booty butty'],
      ],
      renderFunction() {
        let clickCount = 0;

        const frag = document.createDocumentFragment();
        const count = document.createElement('span');
        const button = document.createElement('button');
        button.textContent = '+1';
        button.addEventListener('click', function () {
          clickCount++;
          count.textContent = clickCount;
        });
        frag.appendChild(button);
        frag.appendChild(count);
        return frag;
      },
    },
    {
      type: tileTypeEnum.INTERACTIVE,
      cellAttributes: [['data-cell-type', 'interactive']],
    },
    { type: tileTypeEnum.OPEN },
  ],
  [
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },

    {
      type: tileTypeEnum.BARRIER,
      cellAttributes: [['data-cell-type', 'barrier']],
    },
  ],
  [
    {
      type: tileTypeEnum.BARRIER,
      cellAttributes: [['data-cell-type', 'barrier']],
    },
    { type: tileTypeEnum.OPEN },
    { type: tileTypeEnum.OPEN },
  ],
];

function createGrid() {
  console.log('building grid');

  return new GameGrid(
    {
      matrix,
      options: {
        infinite_y: true,
        infinite_x: true,
        clickable: true,
        arrow_controls: true,
        wasd_controls: true,
        callbacks: {
          LIMIT: function (x) {
            console.log('callback for LIMIT', x);
          },
          WRAP_Y: function (x) {
            console.log('callback WRAP_Y', x);
          },
        },
      },
    },
    document.getElementById('grid1'),
  );
}

document.addEventListener('DOMContentLoaded', function () {
  attachListeners();
  const grid = createGrid();
  console.log(grid);
  new GameGrid(
    {
      matrix: matrix2,
    },
    document.getElementById('grid2'),
  );

  renderMaze('#maze', 50);
  renderMaze('#maze2', 10);
});
