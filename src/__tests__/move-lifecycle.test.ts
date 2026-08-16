import { matrix } from '../__mocks__/matrix';
import GameGrid, { gridEventsEnum } from '../index';
import type { GameGridDOMEvent, ICell } from '../interfaces';

function open(extra: Partial<ICell> = {}): ICell {
  return { type: 'open', ...extra };
}

function interactive(extra: Partial<ICell> = {}): ICell {
  return { type: 'interactive', ...extra };
}

function barrier(): ICell {
  return { type: 'barrier' };
}

describe('ICell.eventTypes', () => {
  test('fires onExit then onEnter when the active cell changes', () => {
    const events: string[] = [];
    const target = new EventTarget();
    const leaving: ICell = open({
      eventTypes: { onEnter: 'cell:enter-a', onExit: 'cell:exit-a' },
    });
    const arriving: ICell = open({
      eventTypes: { onEnter: 'cell:enter-b', onExit: 'cell:exit-b' },
    });
    target.addEventListener('cell:exit-a', (event: Event) => {
      events.push('cell:exit-a');
      const detail = (event as GameGridDOMEvent).detail;
      expect(detail.coords).toEqual([0, 0]);
      expect(detail.cell).toBe(leaving);
    });
    target.addEventListener('cell:enter-b', (event: Event) => {
      events.push('cell:enter-b');
      const detail = (event as GameGridDOMEvent).detail;
      expect(detail.coords).toEqual([1, 0]);
      expect(detail.cell).toBe(arriving);
    });
    target.addEventListener('cell:enter-a', () => events.push('cell:enter-a'));
    target.addEventListener('cell:exit-b', () => events.push('cell:exit-b'));

    const grid = new GameGrid({
      matrix: [[leaving, arriving]],
      options: { eventTarget: target },
      state: { activeCoords: [0, 0] },
    });
    grid.moveRight();

    expect(events).toEqual(['cell:exit-a', 'cell:enter-b']);
    grid.destroy();
  });

  test('does not fire on blocked stays or render', () => {
    const events: string[] = [];
    const target = new EventTarget();
    const start: ICell = open({
      eventTypes: { onEnter: 'cell:enter', onExit: 'cell:exit' },
    });
    target.addEventListener('cell:enter', () => events.push('enter'));
    target.addEventListener('cell:exit', () => events.push('exit'));

    const mount = document.createElement('div');
    const grid = new GameGrid(
      {
        matrix: [[start, barrier()]],
        options: { eventTarget: target },
        state: { activeCoords: [0, 0] },
      },
      mount,
    );
    expect(events).toEqual([]);

    grid.moveRight();
    expect(grid.getState().activeCoords).toEqual([0, 0]);
    expect(events).toEqual([]);
    grid.destroy();
  });

  test('fires when rewinding onto or off a cell', () => {
    const events: string[] = [];
    const target = new EventTarget();
    const start: ICell = open({
      eventTypes: { onEnter: 'enter-start', onExit: 'exit-start' },
    });
    const next: ICell = open({
      eventTypes: { onEnter: 'enter-next', onExit: 'exit-next' },
    });
    for (const name of ['enter-start', 'exit-start', 'enter-next', 'exit-next']) {
      target.addEventListener(name, () => events.push(name));
    }
    const grid = new GameGrid({
      matrix: [[start, next]],
      options: { eventTarget: target },
      state: { activeCoords: [0, 0] },
    });
    grid.moveRight();
    events.length = 0;
    grid.rewind();
    expect(events).toEqual(['exit-next', 'enter-start']);
    grid.destroy();
  });
});

describe('onLand / MOVE_LAND only when the cell changes', () => {
  test('does not fire on a blocked stay', () => {
    const onLand = vi.fn();
    const target = new EventTarget();
    const lands: string[] = [];
    target.addEventListener(gridEventsEnum.MOVE_LAND, () => lands.push('land'));
    const grid = new GameGrid({
      matrix,
      options: { eventTarget: target, callbacks: { onLand } },
      state: { activeCoords: [1, 0] },
    });
    onLand.mockClear();
    grid.moveRight();
    expect(grid.getState().activeCoords).toEqual([1, 0]);
    expect(onLand).not.toHaveBeenCalled();
    expect(lands).toEqual([]);
    grid.destroy();
  });

  test('does not fire on a finite-edge bump', () => {
    const onLand = vi.fn();
    const onBoundary = vi.fn();
    const grid = new GameGrid({
      matrix,
      options: { infiniteX: false, infiniteY: false, callbacks: { onLand, onBoundary } },
      state: { activeCoords: [0, 0] },
    });
    onLand.mockClear();
    grid.moveUp();
    expect(grid.getState().activeCoords).toEqual([0, 0]);
    expect(onBoundary).toHaveBeenCalledTimes(1);
    expect(onLand).not.toHaveBeenCalled();
    grid.destroy();
  });

  test('does not fire from render() or construction with a container', () => {
    const onLand = vi.fn();
    const onCollide = vi.fn();
    const onDettach = vi.fn();
    const target = new EventTarget();
    const events: string[] = [];
    for (const name of [
      gridEventsEnum.MOVE_LAND,
      gridEventsEnum.MOVE_COLLISION,
      gridEventsEnum.MOVE_DETTACH,
    ]) {
      target.addEventListener(name, () => events.push(name));
    }
    const mount = document.createElement('div');
    const grid = new GameGrid(
      {
        matrix: [[interactive(), open()]],
        options: { eventTarget: target, callbacks: { onLand, onCollide, onDettach } },
        state: { activeCoords: [0, 0], currentDirection: 'UP' },
      },
      mount,
    );
    expect(onLand).not.toHaveBeenCalled();
    expect(onCollide).not.toHaveBeenCalled();
    expect(onDettach).not.toHaveBeenCalled();
    expect(events).toEqual([]);
    expect(grid.getState().currentDirection).toBe('UP');
    expect(grid.getActiveCell().current?.classList.contains('gamegrid__cell--active')).toBe(true);
    grid.destroy();
  });

  test('still fires after a successful move', () => {
    const onLand = vi.fn();
    const grid = new GameGrid({
      matrix,
      options: { callbacks: { onLand } },
      state: { activeCoords: [0, 0] },
    });
    grid.moveDown();
    expect(onLand).toHaveBeenCalledTimes(1);
    grid.destroy();
  });
});

describe('onDettach only when leaving a collide cell', () => {
  test('does not fire when staying on a collide cell (blocked)', () => {
    const onDettach = vi.fn();
    const onCollide = vi.fn();
    const grid = new GameGrid({
      matrix: [[interactive(), barrier()]],
      options: { callbacks: { onDettach, onCollide } },
      state: { activeCoords: [0, 0] },
    });
    grid.moveRight();
    expect(grid.getState().activeCoords).toEqual([0, 0]);
    expect(onDettach).not.toHaveBeenCalled();
    expect(onCollide).not.toHaveBeenCalled();
    grid.destroy();
  });

  test('does not fire when moving collide → collide', () => {
    const onDettach = vi.fn();
    const onCollide = vi.fn();
    const grid = new GameGrid({
      matrix: [[interactive(), interactive()]],
      options: { callbacks: { onDettach, onCollide } },
      state: { activeCoords: [0, 0] },
    });
    grid.moveRight();
    expect(onDettach).not.toHaveBeenCalled();
    expect(onCollide).toHaveBeenCalledTimes(1);
    grid.destroy();
  });

  test('fires when leaving a collide cell for an open cell', () => {
    const onDettach = vi.fn();
    const grid = new GameGrid({
      matrix: [[interactive(), open()]],
      options: { callbacks: { onDettach } },
      state: { activeCoords: [0, 0] },
    });
    grid.moveRight();
    expect(onDettach).toHaveBeenCalledTimes(1);
    grid.destroy();
  });
});

describe('getActiveCell / getPreviousCell follow setCell', () => {
  test('see the new matrix cell immediately and keep the mounted node until refresh', () => {
    const mount = document.createElement('div');
    document.body.appendChild(mount);
    const grid = new GameGrid(
      { matrix: [[open({ token: 'old' }), open()]], state: { activeCoords: [0, 0] } },
      mount,
    );
    const painted = grid.getActiveCell().current;
    expect(painted).toBeTruthy();

    const next: ICell = { type: 'barrier', token: 'new' };
    grid.setCell([0, 0], next);

    expect(grid.getCell([0, 0])).toBe(next);
    expect(grid.getActiveCell().type).toBe('barrier');
    expect(grid.getActiveCell().token).toBe('new');
    expect(grid.getActiveCell().current).toBe(painted);
    expect(grid.getPreviousCell().type).toBe('barrier');
    expect(grid.getPreviousCell().token).toBe('new');

    grid.destroy();
    mount.remove();
  });

  test('getPreviousCell follows setCell after a real move', () => {
    const grid = new GameGrid({
      matrix: [[open({ token: 'start' }), open({ token: 'next' })]],
      state: { activeCoords: [0, 0] },
    });
    grid.moveRight();
    grid.setCell([0, 0], { type: 'barrier', token: 'rewritten' });
    expect(grid.getPreviousCell().type).toBe('barrier');
    expect(grid.getPreviousCell().token).toBe('rewritten');
    expect(grid.getActiveCell().token).toBe('next');
    grid.destroy();
  });
});

describe('destroy and setMatrix bookkeeping', () => {
  test('destroy runs middleware for the rendered: false patch', () => {
    const pre = vi.fn();
    const post = vi.fn();
    const grid = new GameGrid({
      matrix,
      options: { middlewares: { pre: [pre], post: [post] } },
    });
    pre.mockClear();
    post.mockClear();
    grid.destroy();
    expect(pre).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledTimes(1);
    expect(grid.getState().rendered).toBe(false);
  });

  test('setMatrix on a headless grid aliases refs.cells to the new matrix', () => {
    const grid = new GameGrid({ matrix });
    const replacement: ICell[][] = [[open({ id: 'next' })]];
    grid.setMatrix(replacement);
    expect(grid.getMatrix()).toBe(replacement);
    expect(grid.refs.cells).toBe(replacement);
    expect(grid.getActiveCell()).toBe(replacement[0][0]);
    grid.destroy();
  });
});
