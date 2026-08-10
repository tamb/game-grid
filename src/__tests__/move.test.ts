import { matrix } from '../__mocks__/matrix';
import { keycodeEnum } from '../enums';
import GameGrid from '../index';

describe('Move methods', () => {
  let renderedGrid: GameGrid;

  beforeAll(() => {
    document.body.insertAdjacentHTML('afterbegin', '<div id="root"></div>');
  });

  beforeEach(() => {
    renderedGrid = new GameGrid(
      {
        matrix,
        state: {
          activeCoords: [1, 1],
        },
      },
      document.getElementById('root')!,
    );
  });

  afterEach(() => {
    renderedGrid.destroy();
    renderedGrid = null!;
  });

  test('move length initializes as 1', () => {
    expect(renderedGrid.getState().moves?.length).toBe(1);
  });

  test('move is added to moves', () => {
    renderedGrid.moveRight();
    renderedGrid.moveDown();
    expect(renderedGrid.getState().moves?.length).toBe(3);
  });

  test('move length doesnt pass rewind limit', () => {
    const x = new GameGrid(
      {
        matrix,
        options: { rewindLimit: 2 },
        state: {
          activeCoords: [1, 0],
        },
      },
      document.getElementById('root')!,
    );
    x.moveRight();
    x.moveRight();
    expect(x.getState().moves?.length).toBe(2);
  });

  test('moveLeft moves left', () => {
    renderedGrid.moveLeft();
    const state = renderedGrid.getState();
    expect(state.prevCoords).toEqual([1, 1]);
    expect(state.activeCoords).toEqual([0, 1]);
  });

  test('moveRight moves right', () => {
    renderedGrid.moveRight();
    const state = renderedGrid.getState();
    expect(state.prevCoords).toEqual([1, 1]);
    expect(state.activeCoords).toEqual([2, 1]);
  });

  test('moveUp moves up', () => {
    renderedGrid.moveUp();
    const state = renderedGrid.getState();
    expect(state.prevCoords).toEqual([1, 1]);
    expect(state.activeCoords).toEqual([1, 0]);
  });

  test('moveDown moves down', () => {
    renderedGrid.moveDown();
    const state = renderedGrid.getState();
    expect(state.prevCoords).toEqual([1, 1]);
    expect(state.activeCoords).toEqual([1, 2]);
  });

  test("moveUp sets direction to 'UP'", () => {
    renderedGrid.moveUp();
    expect(renderedGrid.getState().currentDirection).toBe('UP');
  });

  test("moveDown sets direction to 'DOWN'", () => {
    renderedGrid.moveDown();
    expect(renderedGrid.getState().currentDirection).toBe('DOWN');
  });

  test("moveLeft sets direction to 'LEFT'", () => {
    renderedGrid.moveLeft();
    expect(renderedGrid.getState().currentDirection).toBe('LEFT');
  });

  test("moveRight sets direction to 'RIGHT'", () => {
    renderedGrid.moveRight();
    expect(renderedGrid.getState().currentDirection).toBe('RIGHT');
  });

  test('Moving on right side edge works', () => {
    expect(renderedGrid.getState().activeCoords).toEqual([1, 1]);
    renderedGrid.moveRight();
    renderedGrid.moveDown();
    expect(renderedGrid.getState().activeCoords).toEqual([2, 2]);
  });

  // test("hitting limit fires events", () => {});
  // test("hitting interactive fires interactive", () => {});
  // test("hitting barrier fires barrier", () => {});
  // test("hitting custom type fires custom type event", () => {});
  // test("moveLeft unblocked goes left", () => {});
  test('move attempt into barrier stays put', () => {
    renderedGrid.moveUp();
    renderedGrid.moveRight();
    const state = renderedGrid.getState();
    expect(state.activeCoords).toEqual([1, 0]);
  });
  // test("moveRight unblocked goes left", () => {});
  // test("moveRight blocked stays", () => {});
  // test("moveUp unblocked goes left", () => {});
  // test("moveUp blocked stays", () => {});
  // test("moveDown unblocked goes left", () => {});

  test('getPreviousCell resolves prior coords correctly when x and y differ', () => {
    renderedGrid.setStateSync({ activeCoords: [2, 1] });
    renderedGrid.moveLeft();
    expect(renderedGrid.getState().prevCoords).toEqual([2, 1]);
    expect(renderedGrid.getPreviousCell().coords).toEqual([2, 1]);
  });

  test('getCell indexes matrix as [x,y] into matrix[y][x]', () => {
    expect(renderedGrid.getCell([2, 1])).toBe(matrix[1][2]);
  });

  test('moveOnType allowlist blocks entering non-listed types', () => {
    const mount = document.createElement('div');
    document.body.appendChild(mount);
    const allowOnlyOpen = new GameGrid(
      {
        matrix,
        options: { moveOnType: ['open'] },
        state: { activeCoords: [0, 1] },
      },
      mount,
    );
    allowOnlyOpen.moveRight();
    expect(allowOnlyOpen.getState().activeCoords).toEqual([0, 1]);
    allowOnlyOpen.destroy();
    mount.remove();
  });
});

describe('moveDebounce', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="root"></div>';
    container = document.getElementById('root')!;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('scalar debounce blocks rapid moves in any direction', () => {
    const grid = new GameGrid(
      {
        matrix,
        options: { moveDebounce: 100 },
        state: { activeCoords: [1, 1] },
      },
      container,
    );

    grid.moveRight();
    expect(grid.getState().activeCoords).toEqual([2, 1]);

    grid.moveLeft();
    expect(grid.getState().activeCoords).toEqual([2, 1]);

    vi.advanceTimersByTime(100);
    grid.moveLeft();
    expect(grid.getState().activeCoords).toEqual([1, 1]);

    grid.destroy();
  });

  test('per-direction array debounces only configured directions', () => {
    const grid = new GameGrid(
      {
        matrix,
        options: { moveDebounce: [0, 100, 0, 0] },
        state: { activeCoords: [0, 1] },
      },
      container,
    );

    grid.moveRight();
    expect(grid.getState().activeCoords).toEqual([1, 1]);

    grid.moveRight();
    expect(grid.getState().activeCoords).toEqual([1, 1]);

    grid.moveLeft();
    expect(grid.getState().activeCoords).toEqual([0, 1]);

    vi.advanceTimersByTime(100);
    grid.moveRight();
    expect(grid.getState().activeCoords).toEqual([1, 1]);

    grid.destroy();
  });

  test('debounced moves do not invoke onMove', () => {
    const onMove = vi.fn();
    const grid = new GameGrid(
      {
        matrix,
        options: {
          moveDebounce: 100,
          callbacks: { onMove },
        },
        state: { activeCoords: [1, 1] },
      },
      container,
    );

    grid.moveRight();
    grid.moveRight();
    expect(onMove).toHaveBeenCalledTimes(1);

    grid.destroy();
  });

  test('unset moveDebounce allows unrestricted moves', () => {
    const grid = new GameGrid(
      {
        matrix,
        state: { activeCoords: [0, 1] },
      },
      container,
    );

    grid.moveRight();
    grid.moveRight();
    expect(grid.getState().activeCoords).toEqual([2, 1]);

    grid.destroy();
  });

  test('keyboard input respects moveDebounce', () => {
    const grid = new GameGrid(
      {
        matrix,
        options: { moveDebounce: 100 },
        state: { activeCoords: [0, 1] },
      },
      container,
    );

    container.dispatchEvent(
      new KeyboardEvent('keydown', {
        code: keycodeEnum.ArrowRight,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(grid.getState().activeCoords).toEqual([1, 1]);

    container.dispatchEvent(
      new KeyboardEvent('keydown', {
        code: keycodeEnum.ArrowRight,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(grid.getState().activeCoords).toEqual([1, 1]);

    vi.advanceTimersByTime(100);
    container.dispatchEvent(
      new KeyboardEvent('keydown', {
        code: keycodeEnum.ArrowRight,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(grid.getState().activeCoords).toEqual([2, 1]);

    grid.destroy();
  });
});
