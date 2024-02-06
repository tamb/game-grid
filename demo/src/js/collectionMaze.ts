import GameGrid from 'gamegrid';
import { generateMaze } from './maze';
import Coin from './coin';

Coin();

function createCoinGrid() {
  const coinMaze = generateMaze(10, 10);

  coinMaze.forEach((row, rowIndex) => {
    //@ts-ignore
    row.forEach((cell: ICell) => {
      if (cell.type === 'interactive') {
        cell.render = () => document.createElement('game-coin');
      }
    });
  });

  const coinGrid = new GameGrid(
    {
      matrix: coinMaze,
      options: {
        id: 'coinGrid',
        infiniteX: true,
        infiniteY: true,
        callbacks: {
          onMove: function () {
            console.log('onMove');
          },
          onCollide: function () {
            console.log('onCollide');
          },
          onDettach: function () {
            console.log('onDettach');
          },
          onBlock: function () {
            console.log('onBlock');
          },
          onWrap: function () {
            console.log('onWrap');
          },
          onLand: function () {
            console.log('onLand');
          },
          onBoundary: function () {
            console.log('onBoundary');
          },
        },
      },
    },
    document.querySelector<HTMLElement>('#maze3')!,
  );

  console.log('Coin Grid: ', coinGrid);

  window.addEventListener(
    'gamegrid:move:collide',
    function (e: CustomEventInit) {
      if (e.detail.gameGridInstance.options.id === 'coinGrid') {
        const cell = e.detail.gameGridInstance.getActiveCell();
        cell.current.querySelector('game-coin')?.remove();
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
