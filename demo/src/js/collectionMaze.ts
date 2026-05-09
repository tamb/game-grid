import type { ICell, IGameGrid } from '@tamb/gamegrid';
import GameGrid, { GameGridDOMEvent, gridEventsEnum } from '@tamb/gamegrid';
import { wireDirectionPad } from './mobile-controls.ts';
import { generateMaze } from './maze';
import Coin from './coin';

Coin();

let coinGrid: IGameGrid | null = null;

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

  coinGrid = new GameGrid(
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

  console.log('Coin Grid: ', coinGrid!);
}

export function setupCoinGrid() {
  window.addEventListener(gridEventsEnum.MOVE_COLLISION, (ev: Event) => {
    const e = ev as GameGridDOMEvent;
    if (e.detail.gameGridInstance.options.id === 'coinGrid') {
      const cell = e.detail.gameGridInstance.getActiveCell();
      cell.current?.querySelector('game-coin')?.remove();
    }
  });
  createCoinGrid();
  wireDirectionPad(() => coinGrid, '#coin-demo-dpad');
  document
    .querySelector('#regenerate-maze')
    ?.addEventListener('click', function () {
      document.getElementById('maze3')!.innerHTML = '';
      createCoinGrid();
    });
}
