import { ICell } from '../dist/interfaces';
import GameGrid from './../dist/main';
import { generateMaze } from './maze';
import Coin from './coin';

Coin();

function createCoinGrid() {
  const coinMaze = generateMaze(10, 10);

  coinMaze.forEach((row, rowIndex) => {
    row.forEach((cell: ICell) => {
      if (cell.type === 'interactive') {
        cell.render = () => document.createElement('game-coin');
      }
    });
  });

  const coinGrid: GameGrid = new GameGrid(
    {
      matrix: coinMaze,
      options: {
        id: 'coinGrid',
      },
    },
    document.querySelector('#maze3'),
  );

  console.log('Coin Grid: ', coinGrid);

  window.addEventListener(
    'gamegrid:move:collide',
    function (e: CustomEventInit) {
      if (e.detail.gameGridInstance.options.id === 'coinGrid') {
        const state = e.detail.gameGridInstance.state;
        const activeCell = state.activeCoords;
        const cell = coinGrid.refs.cells[activeCell[0]][activeCell[1]];
        cell.querySelector('game-coin')?.remove();
      }
    },
  );
}

export function setupCoinGrid() {
  createCoinGrid();
  document
    .querySelector('#regenerate-maze')
    ?.addEventListener('click', function () {
      document.getElementById('maze3')!.innerHTML = '';
      createCoinGrid();
    });
}
