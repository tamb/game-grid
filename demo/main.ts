import './styles.scss';
import { attachListeners } from './eventListeners.js';
import { renderMaze } from './maze.js';
import { createGrid } from './grid1.js';
import { createCoinGrid } from './collectionMaze.js';

document.addEventListener('DOMContentLoaded', function () {
  attachListeners();
  createGrid();
  renderMaze('#maze', 50);
  renderMaze('#maze2', 10);
  createCoinGrid();
});
