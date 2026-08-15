import { matrix } from '../__mocks__/matrix';
import GameGrid, { gridEventsEnum } from '../index';

describe('rewind history', () => {
  let container: HTMLDivElement;
  let grid: GameGrid;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    container = document.getElementById('root')!;
    grid = new GameGrid(
      {
        matrix,
        state: { activeCoords: [0, 0] },
      },
      container,
    );
  });

  afterEach(() => {
    grid.destroy();
  });

  test('seeds moves with the starting cell', () => {
    expect(grid.getState().moves).toEqual([[0, 0]]);
  });

  test('records landed cells oldest-first including the current cell', () => {
    grid.moveDown();
    grid.moveDown();
    grid.moveRight();
    expect(grid.getState().moves).toEqual([
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ]);
    expect(grid.getState().activeCoords).toEqual([1, 2]);
  });

  test('headless grids seed history so the first move can rewind', () => {
    const headless = new GameGrid({
      matrix,
      state: { activeCoords: [0, 0] },
    });
    expect(headless.getState().moves).toEqual([[0, 0]]);
    headless.moveDown();
    expect(headless.getState().moves).toEqual([
      [0, 0],
      [0, 1],
    ]);
    headless.rewind();
    expect(headless.getState().activeCoords).toEqual([0, 0]);
    expect(headless.getState().moves).toEqual([[0, 0]]);
    headless.destroy();
  });
});

describe('rewind()', () => {
  let container: HTMLDivElement;
  let grid: GameGrid;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    container = document.getElementById('root')!;
    grid = new GameGrid(
      {
        matrix,
        state: { activeCoords: [0, 0] },
      },
      container,
    );
    grid.moveDown();
    grid.moveDown();
    grid.moveRight();
  });

  afterEach(() => {
    grid.destroy();
  });

  test('steps back one history entry by default', () => {
    grid.rewind();
    expect(grid.getState().activeCoords).toEqual([0, 2]);
    expect(grid.getState().prevCoords).toEqual([1, 2]);
    expect(grid.getState().moves).toEqual([
      [0, 0],
      [0, 1],
      [0, 2],
    ]);
    expect(grid.getState().currentDirection).toBe('LEFT');
  });

  test('steps back multiple entries and clamps to the oldest', () => {
    grid.rewind(2);
    expect(grid.getState().activeCoords).toEqual([0, 1]);
    expect(grid.getState().moves).toEqual([
      [0, 0],
      [0, 1],
    ]);

    grid.rewind(99);
    expect(grid.getState().activeCoords).toEqual([0, 0]);
    expect(grid.getState().moves).toEqual([[0, 0]]);
  });

  test('no-ops at the oldest entry and for non-positive steps', () => {
    grid.rewind(99);
    const before = grid.getState();
    grid.rewind();
    grid.rewind(0);
    grid.rewind(-1);
    grid.rewind(Number.NaN);
    expect(grid.getState().activeCoords).toEqual(before.activeCoords);
    expect(grid.getState().moves).toEqual(before.moves);
  });

  test('new moves continue from the truncated trail', () => {
    grid.rewind();
    grid.moveUp();
    expect(grid.getState().activeCoords).toEqual([0, 1]);
    expect(grid.getState().moves).toEqual([
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 1],
    ]);
  });

  test('updates the active cell in the DOM', () => {
    grid.rewind();
    const [x, y] = grid.getState().activeCoords;
    expect(grid.refs.cells[y][x].current?.classList.contains('gamegrid__cell--active')).toBe(true);
    expect(grid.refs.cells[2][1].current?.classList.contains('gamegrid__cell--active')).toBe(false);
  });

  test('is not rate-limited by moveDebounce', () => {
    vi.useFakeTimers();
    const debounced = new GameGrid(
      {
        matrix,
        options: { moveDebounce: 1000 },
        state: { activeCoords: [0, 0] },
      },
      container,
    );
    debounced.moveDown();
    debounced.moveDown();
    expect(debounced.getState().activeCoords).toEqual([0, 1]);

    debounced.rewind();
    expect(debounced.getState().activeCoords).toEqual([0, 0]);
    debounced.destroy();
    vi.useRealTimers();
  });
});

describe('rewindTo()', () => {
  let container: HTMLDivElement;
  let grid: GameGrid;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    container = document.getElementById('root')!;
    grid = new GameGrid(
      {
        matrix,
        state: { activeCoords: [0, 0] },
      },
      container,
    );
    grid.moveDown();
    grid.moveDown();
    grid.moveRight();
  });

  afterEach(() => {
    grid.destroy();
  });

  test('jumps to a history index and truncates later entries', () => {
    grid.rewindTo(1);
    expect(grid.getState().activeCoords).toEqual([0, 1]);
    expect(grid.getState().moves).toEqual([
      [0, 0],
      [0, 1],
    ]);
  });

  test('no-ops for the current index and out-of-range values', () => {
    const before = structuredClone(grid.getState().moves);
    grid.rewindTo(3);
    grid.rewindTo(-1);
    grid.rewindTo(1.5);
    grid.rewindTo(99);
    expect(grid.getState().activeCoords).toEqual([1, 2]);
    expect(grid.getState().moves).toEqual(before);
  });
});

describe('rewind events and callbacks', () => {
  test('emits REWIND then MOVE_LAND and invokes onRewind / onLand', () => {
    const events: string[] = [];
    const target = new EventTarget();
    const onRewind = vi.fn();
    const onLand = vi.fn();
    const grid = new GameGrid({
      matrix,
      options: {
        eventTarget: target,
        callbacks: { onRewind, onLand },
      },
      state: { activeCoords: [0, 0] },
    });

    target.addEventListener(gridEventsEnum.REWIND, (event: Event) => {
      events.push(gridEventsEnum.REWIND);
      const detail = (event as CustomEvent).detail;
      expect(detail.steps).toBe(1);
      expect(detail.index).toBe(0);
      expect(detail.gameGridInstance).toBe(grid);
    });
    target.addEventListener(gridEventsEnum.MOVE_LAND, () => {
      events.push(gridEventsEnum.MOVE_LAND);
    });

    grid.moveDown();
    events.length = 0;
    onLand.mockClear();

    grid.rewind();
    expect(events).toEqual([gridEventsEnum.REWIND, gridEventsEnum.MOVE_LAND]);
    expect(onRewind).toHaveBeenCalledTimes(1);
    expect(onLand).toHaveBeenCalledTimes(1);
    grid.destroy();
  });

  test('fires collide and dettach when rewinding onto or off an interactive cell', () => {
    const onCollide = vi.fn();
    const onDettach = vi.fn();
    const grid = new GameGrid({
      matrix,
      options: { callbacks: { onCollide, onDettach } },
      state: { activeCoords: [0, 1] },
    });

    grid.moveRight();
    expect(grid.getState().activeCoords).toEqual([1, 1]);
    onCollide.mockClear();
    onDettach.mockClear();

    grid.rewind();
    expect(onDettach).toHaveBeenCalledTimes(1);
    expect(onCollide).not.toHaveBeenCalled();

    grid.moveRight();
    onCollide.mockClear();
    onDettach.mockClear();
    grid.moveRight();
    onCollide.mockClear();
    onDettach.mockClear();

    grid.rewind();
    expect(grid.getState().activeCoords).toEqual([1, 1]);
    expect(onCollide).toHaveBeenCalledTimes(1);
    grid.destroy();
  });
});

describe('rewindLimit', () => {
  test('setOptions trims stored history when the limit shrinks', () => {
    const grid = new GameGrid({
      matrix,
      state: { activeCoords: [0, 0] },
    });
    grid.moveDown();
    grid.moveDown();
    grid.moveRight();
    expect(grid.getState().moves).toHaveLength(4);

    grid.setOptions({ rewindLimit: 2 });
    expect(grid.getState().moves).toEqual([
      [0, 2],
      [1, 2],
    ]);
    grid.destroy();
  });
});
