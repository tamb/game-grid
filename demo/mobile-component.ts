import GameGrid from 'gamegrid';
import { generateMaze } from './maze';

export function setupMobileComponent() {
  const maze = generateMaze(10, 10);
  new GameGrid(
    {
      matrix: maze,
      options: {
        id: 'mobile-component-grid',
      },
    },
    document.querySelector('#mobile-component-grid') as HTMLElement,
  );

  window.addEventListener('gamegrid:move:land', (event: CustomEventInit) => {
    if (event.detail.gameGridInstance.options.id === 'mobile-component-grid') {
      console.log('from mobile component');
      const grid = event.detail.gameGridInstance;
      const state = grid.getState();
      const prev = state.prevCoords;
      const curr = state.currentCoords;

    }
      
  });
}
