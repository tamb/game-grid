import './../styles/styles.scss';
import { attachListeners } from './eventListeners.ts';
import { renderMaze } from './maze.ts';
import { createGrid } from './grid1.ts';
import { setupCoinGrid } from './collectionMaze.ts';
import { setupMobileComponent } from './mobile-component.ts';

document.addEventListener('DOMContentLoaded', function () {
  attachListeners();
  createGrid();
  renderMaze('#maze', 50);
  renderMaze('#maze2', 10);
  setupCoinGrid();
  setupMobileComponent();
});
