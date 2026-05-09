import type { ICell } from '@tamb/gamegrid';
import GameGrid, { GameGridDOMEvent, gridEventsEnum } from '@tamb/gamegrid';
import { generateMaze } from './maze';
import Coin from './coin';

Coin();

function createCoinGrid() {
  const coinMaze = generateMaze(10, 10);

  coinMaze.forEach((row) => {
    row.forEach((cell) => {
      const c = cell as ICell;
      if (c.type === 'interactive') {
        c.render = () => document.createElement('game-coin');
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

  window.addEventListener(gridEventsEnum.MOVE_COLLISION, (ev: Event) => {
    const e = ev as GameGridDOMEvent;
    if (e.detail.gameGridInstance.options.id === 'coinGrid') {
      const cell = e.detail.gameGridInstance.getActiveCell();
      cell.current?.querySelector('game-coin')?.remove();
    }
  });
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
