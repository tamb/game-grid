import { generateMaze } from './maze';
import GameGrid from '../dist/main';

export function setupMobileComponent() {
  const maze = generateMaze(10, 10);
  const gameGrid = new GameGrid(
    {
      matrix: maze,
      options: {
        id: 'mobile-component-grid',
      },
    },
    document.querySelector('#mobile-component-grid'),
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
