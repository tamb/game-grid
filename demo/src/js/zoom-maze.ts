import type { ICell, IGameGrid, ZoomQuadrant } from '@tamb/gamegrid';
import GameGrid, { GameGridDOMEvent, cellTypeEnum, gridEventsEnum } from '@tamb/gamegrid';

const ZOOM_MAZE_SIZE = 20;

type QuadrantId = ZoomQuadrant;

function quadrantFor(x: number, y: number, size: number): QuadrantId {
  const mid = size / 2;
  if (x < mid && y < mid) {
    return 'nw';
  }
  if (x >= mid && y < mid) {
    return 'ne';
  }
  if (x < mid && y >= mid) {
    return 'sw';
  }
  return 'se';
}

function generateQuadrantMaze(size: number): ICell[][] {
  const types = [cellTypeEnum.OPEN, cellTypeEnum.OPEN, cellTypeEnum.OPEN, cellTypeEnum.BARRIER];
  const maze: ICell[][] = [];

  for (let y = 0; y < size; y++) {
    const row: ICell[] = [];
    for (let x = 0; x < size; x++) {
      const quadrant = quadrantFor(x, y, size);
      row.push({
        type: types[Math.floor(Math.random() * types.length)] ?? cellTypeEnum.OPEN,
        cellAttributes: [['data-gamegrid-quadrant', quadrant]],
      });
    }
    maze.push(row);
  }

  return maze;
}

function updateRegionBadge(grid: IGameGrid, badgeId: string): void {
  const badge = document.getElementById(badgeId);
  if (!badge) {
    return;
  }
  const region = grid.getActiveRegion();
  badge.textContent = region?.quadrant?.toUpperCase() ?? '—';
}

function readAnimateToggle(): boolean {
  const input = document.getElementById('zoom-maze-animate') as HTMLInputElement | null;
  return input?.checked ?? true;
}

export function setupZoomMaze(): IGameGrid {
  const container = document.querySelector('#zoom-maze') as HTMLElement;
  const animateZoom = readAnimateToggle();
  const grid = new GameGrid(
    {
      matrix: generateQuadrantMaze(ZOOM_MAZE_SIZE),
      options: {
        regionDivisions: 2,
        animateZoom,
        slideZoomOnEdge: true,
        constrainToZoom: true,
        zoomSlideDuration: 300,
      },
      state: { activeCoords: [15, 15] },
    },
    container,
  );

  grid.zoomQuadrant('se', { animate: animateZoom });
  updateRegionBadge(grid, 'zoom-maze-region');

  const target = grid.getOptions().eventTarget ?? window;
  target.addEventListener(gridEventsEnum.REGION_CHANGE, () =>
    updateRegionBadge(grid, 'zoom-maze-region'),
  );
  target.addEventListener(gridEventsEnum.ZOOM_SET, () =>
    updateRegionBadge(grid, 'zoom-maze-region'),
  );

  document.getElementById('zoom-maze-animate')?.addEventListener('change', (event) => {
    const enabled = (event.target as HTMLInputElement).checked;
    grid.setOptions({ animateZoom: enabled });
  });

  for (const [id, quadrant] of [
    ['zoom-maze-nw', 'nw'],
    ['zoom-maze-ne', 'ne'],
    ['zoom-maze-sw', 'sw'],
    ['zoom-maze-se', 'se'],
  ] as const) {
    document.getElementById(id)?.addEventListener('click', () => {
      grid.zoomQuadrant(quadrant, { animate: readAnimateToggle() });
    });
  }

  document.getElementById('zoom-maze-clear')?.addEventListener('click', () => {
    grid.clearZoom({ animate: readAnimateToggle() });
    updateRegionBadge(grid, 'zoom-maze-region');
  });

  return grid;
}

export function attachZoomMazeListeners(grid: IGameGrid): void {
  const log = document.getElementById('zoom-maze-log');
  if (!log) {
    return;
  }

  const target = grid.getOptions().eventTarget ?? window;
  const write = (label: string) => {
    log.textContent = label;
  };

  target.addEventListener(gridEventsEnum.ZOOM_EDGE, (ev: Event) => {
    const detail = (ev as GameGridDOMEvent).detail;
    write(`Zoom edge (${String(detail.direction ?? 'move')})`);
  });
  target.addEventListener(gridEventsEnum.REGION_CHANGE, (ev: Event) => {
    const detail = ev as GameGridDOMEvent;
    const from = detail.from as { quadrant?: string } | undefined;
    const to = detail.to as { quadrant?: string } | undefined;
    write(`Region ${from?.quadrant ?? '?'} → ${to?.quadrant ?? '?'}`);
  });
}
