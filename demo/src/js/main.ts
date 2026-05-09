import './../styles/styles.scss';
import { attachListeners } from './eventListeners.ts';
import { renderMaze } from './maze.ts';
import { createGrid } from './grid1.ts';
import { setupCoinGrid } from './collectionMaze.ts';
import { setupMobileComponent } from './mobile-component.ts';
import { wireDirectionPad } from './mobile-controls.ts';

document.addEventListener('DOMContentLoaded', function () {
  attachListeners();
  const eventsGrid = createGrid();
  const bigMazeGrid = renderMaze('#maze', 50);
  const miniMazeGrid = renderMaze('#maze2', 10);
  wireDirectionPad(() => eventsGrid, '#events-demo-dpad');
  wireDirectionPad(() => bigMazeGrid, '#bigmaze-demo-dpad');
  wireDirectionPad(() => miniMazeGrid, '#minimaze-demo-dpad');
  setupCoinGrid();
  setupMobileComponent();
});
