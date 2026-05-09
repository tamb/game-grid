import type { IGameGrid } from '@tamb/gamegrid';
import GameGrid, { GameGridDOMEvent, gridEventsEnum } from '@tamb/gamegrid';
import { generateMaze } from './maze';
import { wireDirectionPad } from './mobile-controls.ts';

let mobileDemoGrid: IGameGrid | null = null;

export function setupMobileComponent() {
  const maze = generateMaze(10, 10);
  mobileDemoGrid = new GameGrid(
    {
      matrix: maze,
      options: {
        id: 'mobile-component-grid',
      },
    },
    document.querySelector('#mobile-component-grid') as HTMLElement,
  );

  wireDirectionPad(() => mobileDemoGrid, '#mobile-demo-dpad');

  window.addEventListener(gridEventsEnum.MOVE_LAND, (ev: Event) => {
    const event = ev as GameGridDOMEvent;
    if (event.detail.gameGridInstance.options.id === 'mobile-component-grid') {
      console.log('from mobile component');
      const grid = event.detail.gameGridInstance;
      const state = grid.getState();
      const prev = state.prevCoords;
      const curr = state.activeCoords;
      console.log({ prev, curr });
    }
  });
}
