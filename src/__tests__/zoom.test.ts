import GameGrid, { directionEnum, gridEventsEnum } from '../index';
import type { ICell, IRegionTile } from '../interfaces';
import { getAdjacentRegion } from '../zoom';

const open = (): ICell => ({ type: 'open' });

function makeMatrix(rows: number, cols: number): ICell[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, open));
}

/** 6×6 with a barrier at [2,3] — west neighbor of SE quadrant edge [3,3]. */
function makeMatrixWithWestEdgeBarrier(): ICell[][] {
  const matrix = makeMatrix(6, 6);
  matrix[3][2] = { type: 'barrier' };
  return matrix;
}

describe('zoom helpers and state', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('getQuadrantZoom on 6×6 splits into 3×3 quadrants', () => {
    const grid = new GameGrid({ matrix: makeMatrix(6, 6) });
    expect(grid.getQuadrantZoom('se')).toEqual({
      minX: 3,
      minY: 3,
      maxX: 5,
      maxY: 5,
    });
    expect(grid.getQuadrantZoom('nw')).toEqual({
      minX: 0,
      minY: 0,
      maxX: 2,
      maxY: 2,
    });
    grid.destroy();
  });

  test('getFractionZoom on odd-sized axis gives last tile the remainder', () => {
    const grid = new GameGrid({ matrix: makeMatrix(10, 10) });
    const lastTile = grid.getFractionZoom(3, 2, 2);
    expect(lastTile).toEqual({ minX: 6, minY: 6, maxX: 9, maxY: 9 });
    grid.destroy();
  });

  test('getZoomAround clips to matrix edges', () => {
    const grid = new GameGrid({ matrix: makeMatrix(5, 5) });
    expect(grid.getZoomAround([0, 0], 2)).toEqual({
      minX: 0,
      minY: 0,
      maxX: 2,
      maxY: 2,
    });
    grid.destroy();
  });

  test('setZoom clamps active cell into bounds and stores zoom on state', () => {
    const grid = new GameGrid({
      matrix: makeMatrix(6, 6),
      state: { activeCoords: [5, 5] },
    });
    grid.setZoom({ minX: 0, minY: 0, maxX: 2, maxY: 2 });
    expect(grid.getZoom()).toEqual({ minX: 0, minY: 0, maxX: 2, maxY: 2 });
    expect(grid.getState().activeCoords).toEqual([2, 2]);
    grid.destroy();
  });

  test('clearZoom resets zoom to null', () => {
    const grid = new GameGrid({ matrix: makeMatrix(4, 4) });
    grid.zoomQuadrant('ne');
    expect(grid.getZoom()).not.toBeNull();
    grid.clearZoom();
    expect(grid.getZoom()).toBeNull();
    grid.destroy();
  });
});

describe('zoom animate resolution', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('defaults animate to false on ZOOM_SET', () => {
    const target = new EventTarget();
    let detail: Record<string, unknown> | undefined;
    target.addEventListener(gridEventsEnum.ZOOM_SET, ((e: Event) => {
      detail = (e as CustomEvent).detail;
    }) as EventListener);

    const grid = new GameGrid({
      matrix: makeMatrix(4, 4),
      options: { eventTarget: target },
    });
    grid.setZoom({ minX: 0, minY: 0, maxX: 1, maxY: 1 });
    expect(detail?.animate).toBe(false);
    grid.destroy();
  });

  test('global animateZoom applies when per-call animate is omitted', () => {
    const target = new EventTarget();
    let detail: Record<string, unknown> | undefined;
    target.addEventListener(gridEventsEnum.ZOOM_SET, ((e: Event) => {
      detail = (e as CustomEvent).detail;
    }) as EventListener);

    const grid = new GameGrid({
      matrix: makeMatrix(4, 4),
      options: { eventTarget: target, animateZoom: true },
    });
    grid.setZoom({ minX: 0, minY: 0, maxX: 1, maxY: 1 });
    expect(detail?.animate).toBe(true);
    grid.destroy();
  });

  test('per-call animate overrides global animateZoom', () => {
    const target = new EventTarget();
    let detail: Record<string, unknown> | undefined;
    target.addEventListener(gridEventsEnum.ZOOM_CLEARED, ((e: Event) => {
      detail = (e as CustomEvent).detail;
    }) as EventListener);

    const grid = new GameGrid({
      matrix: makeMatrix(4, 4),
      options: { eventTarget: target, animateZoom: true },
    });
    grid.zoomQuadrant('nw');
    grid.clearZoom({ animate: false });
    expect(detail?.animate).toBe(false);
    grid.destroy();
  });
});

describe('zoom movement constraints', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('constrainToZoom clamps movement at zoom edge and emits ZOOM_EDGE', () => {
    const target = new EventTarget();
    const events: string[] = [];
    for (const name of [gridEventsEnum.ZOOM_EDGE, gridEventsEnum.BOUNDARY_X]) {
      target.addEventListener(name, () => events.push(name));
    }

    const grid = new GameGrid({
      matrix: makeMatrix(6, 6),
      options: { eventTarget: target, constrainToZoom: true },
      state: { activeCoords: [3, 3] },
    });
    grid.zoomQuadrant('se');
    grid.moveLeft();
    expect(grid.getState().activeCoords).toEqual([3, 3]);
    expect(events).toContain(gridEventsEnum.ZOOM_EDGE);
    expect(events).toContain(gridEventsEnum.BOUNDARY_X);
    grid.destroy();
  });

  test('infiniteX wraps within the zoom window', () => {
    const grid = new GameGrid({
      matrix: makeMatrix(6, 6),
      options: { infiniteX: true, constrainToZoom: true },
      state: { activeCoords: [5, 3] },
    });
    grid.zoomQuadrant('se');
    grid.moveRight();
    expect(grid.getState().activeCoords).toEqual([3, 3]);
    grid.destroy();
  });

  test('constrainToZoom false allows leaving zoom and emits ZOOM_EXIT', () => {
    const target = new EventTarget();
    let exitDetail: Record<string, unknown> | undefined;
    target.addEventListener(gridEventsEnum.ZOOM_EXIT, ((e: Event) => {
      exitDetail = (e as CustomEvent).detail;
    }) as EventListener);

    const grid = new GameGrid({
      matrix: makeMatrix(6, 6),
      options: { eventTarget: target, constrainToZoom: false },
      state: { activeCoords: [3, 3] },
    });
    grid.zoomQuadrant('se');
    grid.moveLeft();
    expect(grid.getState().activeCoords).toEqual([2, 3]);
    expect(exitDetail?.direction).toBe(directionEnum.LEFT);
    expect(exitDetail?.zoom).toEqual(grid.getQuadrantZoom('se'));
    grid.destroy();
  });
});

describe('region tracking', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('getRegionAt maps coords to quadrant tiles', () => {
    const grid = new GameGrid({
      matrix: makeMatrix(6, 6),
      options: { regionDivisions: 2 },
    });
    expect(grid.getRegionAt([3, 3])).toMatchObject({
      divisions: 2,
      tileX: 1,
      tileY: 1,
      quadrant: 'se',
    });
    expect(grid.getRegionAt([2, 3])).toMatchObject({ quadrant: 'sw' });
    grid.destroy();
  });

  test('REGION_CHANGE fires when active cell crosses from SE to SW', () => {
    const target = new EventTarget();
    let regionDetail: { from: IRegionTile; to: IRegionTile } | undefined;
    target.addEventListener(gridEventsEnum.REGION_CHANGE, ((e: Event) => {
      regionDetail = (e as CustomEvent).detail as { from: IRegionTile; to: IRegionTile };
    }) as EventListener);

    const grid = new GameGrid({
      matrix: makeMatrix(6, 6),
      options: {
        eventTarget: target,
        regionDivisions: 2,
        constrainToZoom: false,
      },
      state: { activeCoords: [3, 3] },
    });

    grid.moveLeft();
    expect(regionDetail?.from.quadrant).toBe('se');
    expect(regionDetail?.to.quadrant).toBe('sw');
    expect(grid.getActiveRegion()?.quadrant).toBe('sw');
    grid.destroy();
  });

  test('onRegionChange callback fires with updated state.region', () => {
    const onRegionChange = vi.fn();
    const grid = new GameGrid({
      matrix: makeMatrix(6, 6),
      options: {
        regionDivisions: 2,
        constrainToZoom: false,
        callbacks: { onRegionChange },
      },
      state: { activeCoords: [3, 3] },
    });
    grid.moveLeft();
    expect(onRegionChange).toHaveBeenCalled();
    expect(grid.getState().region?.quadrant).toBe('sw');
    grid.destroy();
  });
});

describe('zoom callbacks', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('onZoomSet and onZoomCleared fire', () => {
    const onZoomSet = vi.fn();
    const onZoomCleared = vi.fn();
    const grid = new GameGrid({
      matrix: makeMatrix(4, 4),
      options: { callbacks: { onZoomSet, onZoomCleared } },
    });
    grid.zoomQuadrant('nw');
    grid.clearZoom();
    expect(onZoomSet).toHaveBeenCalledTimes(1);
    expect(onZoomCleared).toHaveBeenCalledTimes(1);
    grid.destroy();
  });

  test('onZoomEdge fires when movement hits zoom boundary', () => {
    const onZoomEdge = vi.fn();
    const grid = new GameGrid({
      matrix: makeMatrix(6, 6),
      options: { callbacks: { onZoomEdge }, constrainToZoom: true },
      state: { activeCoords: [3, 3] },
    });
    grid.zoomQuadrant('se');
    grid.moveLeft();
    expect(onZoomEdge).toHaveBeenCalled();
    grid.destroy();
  });

  test('onZoomExit fires when leaving zoom unconstrained', () => {
    const onZoomExit = vi.fn();
    const grid = new GameGrid({
      matrix: makeMatrix(6, 6),
      options: { callbacks: { onZoomExit }, constrainToZoom: false },
      state: { activeCoords: [3, 3] },
    });
    grid.zoomQuadrant('se');
    grid.moveLeft();
    expect(onZoomExit).toHaveBeenCalled();
    grid.destroy();
  });
});

describe('zoom convenience methods', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('zoomAround delegates to setZoom with computed bounds', () => {
    const grid = new GameGrid({
      matrix: makeMatrix(8, 8),
      state: { activeCoords: [4, 4] },
    });
    grid.zoomAround([4, 4], 1);
    const expected = grid.getZoomAround([4, 4], 1);
    expect(grid.getZoom()).toEqual(expected);
    grid.destroy();
  });

  test('setZoom refreshes region when regionDivisions is configured', () => {
    const grid = new GameGrid({
      matrix: makeMatrix(6, 6),
      options: { regionDivisions: 2 },
      state: { activeCoords: [1, 1] },
    });
    grid.zoomQuadrant('nw');
    expect(grid.getState().region?.quadrant).toBe('nw');
    grid.destroy();
  });
});

describe('zoom validation', () => {
  test('getZoomAround rejects negative radius', () => {
    const grid = new GameGrid({ matrix: makeMatrix(3, 3) });
    expect(() => grid.getZoomAround([1, 1], -1)).toThrow();
    grid.destroy();
  });

  test('getFractionZoom rejects invalid tile index', () => {
    const grid = new GameGrid({ matrix: makeMatrix(6, 6) });
    expect(() => grid.getFractionZoom(2, 2, 0)).toThrow();
    grid.destroy();
  });

  test('getRegionAt requires regionDivisions when not passed', () => {
    const grid = new GameGrid({ matrix: makeMatrix(4, 4) });
    expect(() => grid.getRegionAt([0, 0])).toThrow();
    grid.destroy();
  });
});

describe('zoom filtered render and CSS classes', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="zoom-root"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('zoomQuadrant renders only cells inside the zoom window', () => {
    const grid = new GameGrid(
      { matrix: makeMatrix(6, 6), state: { activeCoords: [3, 3] } },
      document.getElementById('zoom-root')!,
    );
    grid.zoomQuadrant('se');
    const cells = document.querySelectorAll('[data-gamegrid-ref="cell"]');
    expect(cells.length).toBe(9);
    grid.destroy();
  });

  test('clearZoom restores full grid DOM', () => {
    const grid = new GameGrid(
      { matrix: makeMatrix(6, 6), state: { activeCoords: [3, 3] } },
      document.getElementById('zoom-root')!,
    );
    grid.zoomQuadrant('se');
    grid.clearZoom();
    const cells = document.querySelectorAll('[data-gamegrid-ref="cell"]');
    expect(cells.length).toBe(36);
    grid.destroy();
  });

  test('zoom applies container and viewport classes and attributes', () => {
    const grid = new GameGrid(
      {
        matrix: makeMatrix(6, 6),
        options: { regionDivisions: 2, zoomViewportClasses: ['custom-zoom-view'] },
        state: { activeCoords: [3, 3] },
      },
      document.getElementById('zoom-root')!,
    );
    grid.zoomQuadrant('se');
    const container = grid.refs.container!;
    const viewport = container.querySelector('[data-gamegrid-ref="viewport"]') as HTMLElement;
    expect(container.classList.contains('gamegrid--zoomed')).toBe(true);
    expect(viewport.getAttribute('data-gamegrid-zoom')).toBe('3,3,5,5');
    expect(viewport.getAttribute('data-gamegrid-region')).toBe('se');
    expect(viewport.classList.contains('custom-zoom-view')).toBe(true);
    expect(document.querySelectorAll('.gamegrid__cell--zoom-edge').length).toBeGreaterThan(0);
    grid.clearZoom();
    expect(container.classList.contains('gamegrid--zoomed')).toBe(false);
    const clearedViewport = container.querySelector(
      '[data-gamegrid-ref="viewport"]',
    ) as HTMLElement;
    expect(clearedViewport.getAttribute('data-gamegrid-zoom')).toBeNull();
    grid.destroy();
  });
});

describe('getAdjacentRegion', () => {
  test('returns adjacent quadrant tile for cardinal directions', () => {
    const se = { divisions: 2, tileX: 1, tileY: 1, quadrant: 'se' as const };
    expect(getAdjacentRegion(se, 'LEFT')?.quadrant).toBe('sw');
    expect(getAdjacentRegion(se, 'UP')?.quadrant).toBe('ne');
    expect(getAdjacentRegion(se, 'RIGHT')).toBeNull();
  });
});

describe('slideZoomOnEdge', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('blocks movement into adjacent region when beyond-edge cell is a barrier', () => {
    const target = new EventTarget();
    const events: string[] = [];
    for (const name of [
      gridEventsEnum.MOVE_BLOCKED,
      gridEventsEnum.ZOOM_EDGE,
      gridEventsEnum.BOUNDARY_X,
    ]) {
      target.addEventListener(name, () => events.push(name));
    }

    const grid = new GameGrid({
      matrix: makeMatrixWithWestEdgeBarrier(),
      options: { eventTarget: target, constrainToZoom: true },
      state: { activeCoords: [3, 3] },
    });
    grid.zoomQuadrant('se');
    grid.moveLeft();
    expect(grid.getState().activeCoords).toEqual([3, 3]);
    expect(grid.getZoom()).toEqual(grid.getQuadrantZoom('se'));
    expect(events).toContain(gridEventsEnum.MOVE_BLOCKED);
    expect(events).toContain(gridEventsEnum.ZOOM_EDGE);
    expect(events).toContain(gridEventsEnum.BOUNDARY_X);
    grid.destroy();
  });

  test('does not auto-advance zoom when beyond-edge cell is a barrier', () => {
    const grid = new GameGrid({
      matrix: makeMatrixWithWestEdgeBarrier(),
      options: {
        regionDivisions: 2,
        slideZoomOnEdge: true,
        animateZoom: false,
        constrainToZoom: true,
      },
      state: { activeCoords: [3, 3] },
    });
    grid.zoomQuadrant('se');
    grid.moveLeft();
    expect(grid.getState().activeCoords).toEqual([3, 3]);
    expect(grid.getZoom()).toEqual(grid.getQuadrantZoom('se'));
    expect(grid.getState().region?.quadrant).toBe('se');
    grid.destroy();
  });

  test('manual zoomQuadrant aborts when clamp would land on a barrier', () => {
    const onBlock = vi.fn();
    const grid = new GameGrid({
      matrix: makeMatrixWithWestEdgeBarrier(),
      options: {
        regionDivisions: 2,
        constrainToZoom: true,
        callbacks: { onBlock },
      },
      state: { activeCoords: [3, 3] },
    });
    grid.zoomQuadrant('se');
    grid.zoomQuadrant('sw');
    expect(grid.getState().activeCoords).toEqual([3, 3]);
    expect(grid.getZoom()).toEqual(grid.getQuadrantZoom('se'));
    expect(onBlock).toHaveBeenCalledTimes(1);
    grid.destroy();
  });

  test('auto-advances zoom to adjacent region on edge', () => {
    document.body.innerHTML = '<div id="zoom-edge-root"></div>';
    const grid = new GameGrid(
      {
        matrix: makeMatrix(6, 6),
        options: {
          regionDivisions: 2,
          slideZoomOnEdge: true,
          animateZoom: false,
        },
        state: { activeCoords: [3, 3] },
      },
      document.getElementById('zoom-edge-root')!,
    );
    grid.zoomQuadrant('se');
    grid.moveLeft();
    expect(grid.getZoom()).toEqual(grid.getQuadrantZoom('sw'));
    expect(grid.getState().region?.quadrant).toBe('sw');
    grid.destroy();
  });
});

async function flushZoomSlide(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  const viewport = document.querySelector('[data-gamegrid-ref="viewport"]') as HTMLElement | null;
  viewport?.dispatchEvent(
    new TransitionEvent('transitionend', { propertyName: 'transform', bubbles: true }),
  );
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe('animated zoom transitions', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="zoom-animate-root"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('setZoom with animate defers ZOOM_SET until slide completes', async () => {
    const target = new EventTarget();
    let zoomSetCount = 0;
    target.addEventListener(gridEventsEnum.ZOOM_SET, () => {
      zoomSetCount += 1;
    });

    const grid = new GameGrid(
      {
        matrix: makeMatrix(20, 20),
        options: {
          eventTarget: target,
          animateZoom: true,
          regionDivisions: 2,
          zoomSlideDuration: 40,
        },
        state: { activeCoords: [15, 15] },
      },
      document.getElementById('zoom-animate-root')!,
    );

    grid.zoomQuadrant('se', { animate: false });
    const countAfterInitialZoom = zoomSetCount;
    grid.zoomQuadrant('sw', { animate: true });
    expect(zoomSetCount).toBe(countAfterInitialZoom);

    await flushZoomSlide();

    expect(zoomSetCount).toBe(countAfterInitialZoom + 1);
    expect(grid.getZoom()).toEqual(grid.getQuadrantZoom('sw'));
    expect(grid.getState().region?.quadrant).toBe('sw');
    grid.destroy();
  });

  test('clearZoom with animate defers ZOOM_CLEARED until slide completes', async () => {
    const target = new EventTarget();
    let clearedCount = 0;
    target.addEventListener(gridEventsEnum.ZOOM_CLEARED, () => {
      clearedCount += 1;
    });

    const grid = new GameGrid(
      {
        matrix: makeMatrix(6, 6),
        options: {
          eventTarget: target,
          animateZoom: true,
          zoomSlideDuration: 40,
        },
        state: { activeCoords: [3, 3] },
      },
      document.getElementById('zoom-animate-root')!,
    );

    grid.zoomQuadrant('se', { animate: false });
    grid.clearZoom({ animate: true });
    expect(clearedCount).toBe(0);
    expect(grid.getZoom()).toBeNull();

    await flushZoomSlide();

    expect(clearedCount).toBe(1);
    expect(document.querySelectorAll('[data-gamegrid-ref="cell"]').length).toBe(36);
    grid.destroy();
  });

  test('animated edge slide renders union bounds mid-transition', async () => {
    const grid = new GameGrid(
      {
        matrix: makeMatrix(20, 20),
        options: {
          regionDivisions: 2,
          slideZoomOnEdge: true,
          animateZoom: true,
          zoomSlideDuration: 40,
        },
        state: { activeCoords: [10, 15] },
      },
      document.getElementById('zoom-animate-root')!,
    );

    grid.zoomQuadrant('se', { animate: false });
    grid.moveLeft();

    const midCells = document.querySelectorAll('[data-gamegrid-ref="cell"]');
    expect(midCells.length).toBe(200);
    expect(grid.getZoom()).toEqual(grid.getQuadrantZoom('sw'));

    await flushZoomSlide();

    expect(document.querySelectorAll('[data-gamegrid-ref="cell"]').length).toBe(100);
    grid.destroy();
  });

  test('getActiveRegion derives from activeCoords when state.region is unset', () => {
    const grid = new GameGrid({
      matrix: makeMatrix(6, 6),
      options: { regionDivisions: 2 },
      state: { activeCoords: [1, 1] },
    });
    expect(grid.getState().region).toBeNull();
    expect(grid.getActiveRegion()?.quadrant).toBe('nw');
    grid.destroy();
  });

  test('zoomFraction delegates to setZoom bounds', () => {
    const grid = new GameGrid({
      matrix: makeMatrix(6, 6),
      options: { regionDivisions: 2 },
      state: { activeCoords: [3, 3] },
    });
    grid.zoomFraction(2, 0, 1);
    expect(grid.getZoom()).toEqual(grid.getQuadrantZoom('sw'));
    grid.destroy();
  });
});
