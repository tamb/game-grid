import './../styles/styles.scss';
import { wireDirectionPad } from './mobile-controls.ts';
import { attachZoomMazeListeners, setupZoomMaze } from './zoom-maze.ts';

document.addEventListener('DOMContentLoaded', function () {
  const zoomMazeGrid = setupZoomMaze();
  attachZoomMazeListeners(zoomMazeGrid);
  wireDirectionPad(() => zoomMazeGrid, '#zoommaze-demo-dpad');
});
