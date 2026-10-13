import { matrix } from '../__mocks__/matrix';
import GameGrid from '../index';
import type { IState } from '../interfaces';

describe('setStateSync', () => {
  let defaultState: IState | null = null;
  let renderedGrid: GameGrid;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';

    defaultState = {
      activeCoords: [0, 0],
      prevCoords: [0, 0],
      rendered: true,
      moves: [[0, 0]],
      future: [],
      currentDirection: 'DOWN',
      zoom: null,
      region: null,
    };

    renderedGrid = new GameGrid(
      {
        matrix,
      },
      document.getElementById('root')!,
    );
  });

  test('pre middleware fires', () => {
    const pre = vi.fn();
    const x = new GameGrid(
      {
        matrix,
        options: {
          middlewares: {
            pre: [pre],
            post: [],
          },
        },
      },
      document.getElementById('root')!,
    );
    x.setStateSync({ current_direction: 'blueberry' });
    expect(pre).toHaveBeenCalled();
  });

  test('post middleware fires', () => {
    const post = vi.fn();
    const x = new GameGrid(
      {
        matrix,
        options: {
          middlewares: {
            pre: [],
            post: [post],
          },
        },
      },
      document.getElementById('root')!,
    );
    x.setStateSync({ current_direction: 'blueberry' });
    expect(post).toHaveBeenCalled();
  });

  test('pre and post middleware fires in order', () => {
    const pre = vi.fn();
    const post = vi.fn();
    const x = new GameGrid(
      {
        matrix,
        options: {
          middlewares: {
            pre: [pre],
            post: [post],
          },
        },
      },
      document.getElementById('root')!,
    );
    x.setStateSync({ current_direction: 'blueberry' });
    expect(pre).toHaveBeenCalled();
    expect(post).toHaveBeenCalled();
    expect(pre.mock.invocationCallOrder[0]).toBeLessThan(post.mock.invocationCallOrder[0]);
  });

  test('multiple pre and post middleware fire in order', () => {
    const pre1 = vi.fn();
    const pre2 = vi.fn();
    const post1 = vi.fn();
    const post2 = vi.fn();
    const x = new GameGrid(
      {
        matrix,
        options: {
          middlewares: {
            pre: [pre1, pre2],
            post: [post1, post2],
          },
        },
      },
      document.getElementById('root')!,
    );
    x.setStateSync({ current_direction: 'blueberry' });
    expect(pre1).toHaveBeenCalled();
    expect(pre2).toHaveBeenCalled();
    expect(post1).toHaveBeenCalled();
    expect(post2).toHaveBeenCalled();
    expect(pre1.mock.invocationCallOrder[0]).toBeLessThan(pre2.mock.invocationCallOrder[0]);
    expect(pre2.mock.invocationCallOrder[0]).toBeLessThan(post1.mock.invocationCallOrder[0]);
    expect(post1.mock.invocationCallOrder[0]).toBeLessThan(post2.mock.invocationCallOrder[0]);
  });

  test('setStateSync updates whole state correctly', () => {
    const newState = {
      activeCoords: [0, 1],
      prevCoords: [0, 0],
      rendered: true,
      moves: [
        [0, 0],
        [0, 1],
      ],
      future: [],
      currentDirection: 'UP',
      zoom: null,
      region: null,
    };
    renderedGrid.setStateSync(newState);
    expect(renderedGrid.getState()).toEqual(newState);
  });

  test('setStateSync updates partial state correctly', () => {
    renderedGrid.setStateSync({ currentDirection: 'blueberry' });
    expect(renderedGrid.getState().currentDirection).toMatch('blueberry');
    expect(renderedGrid.getState().rendered).toBe(true);
  });

  test('getState return full state', () => {
    expect(renderedGrid.getState().moves?.length).toBe(1);
    expect(renderedGrid.getState()).toEqual(defaultState);
  });

  test('initial state defaults correctly', () => {
    expect(renderedGrid.getState()).toEqual(defaultState);
  });

  test('post middleware can read merged state via getState', () => {
    const post = vi.fn();
    const grid = new GameGrid({
      matrix,
      options: {
        middlewares: { post: [post] },
      },
    });
    grid.setStateSync({ currentDirection: 'UP' });
    expect(post.mock.calls.length).toBeGreaterThanOrEqual(1);
    const lastGg = post.mock.calls.at(-1)![0];
    expect(lastGg.getState().currentDirection).toBe('UP');
  });

  test('initial state accepts values', () => {
    const newState = {
      activeCoords: [1, 1],
    };
    const newGrid = new GameGrid(
      {
        matrix,
        state: newState,
      },
      document.getElementById('root')!,
    );

    expect(newGrid.getState().activeCoords).toEqual([1, 1]);
  });

  test('grids do not share default coordinate arrays', () => {
    const row = [[{ type: 'open' }]];
    const a = new GameGrid({ matrix: row });
    const b = new GameGrid({ matrix: row });
    expect(a.getState().activeCoords).not.toBe(b.getState().activeCoords);
    expect(a.getState().prevCoords).not.toBe(b.getState().prevCoords);
    expect(a.getState().future).not.toBe(b.getState().future);
    expect(a.getState().moves).not.toBe(b.getState().moves);

    a.getState().activeCoords[0] = 4;
    a.getState().future.push([1, 0]);
    expect(b.getState().activeCoords).toEqual([0, 0]);
    expect(b.getState().future).toEqual([]);

    const seededMoves = [
      [0, 0],
      [1, 0],
    ];
    const seeded = new GameGrid({
      matrix: row,
      state: { activeCoords: [1, 0], moves: seededMoves, future: [[2, 0]] },
    });
    seededMoves[1][0] = 9;
    expect(seeded.getState().moves).toEqual([
      [0, 0],
      [1, 0],
    ]);
    expect(seeded.getState().future).toEqual([[2, 0]]);
    expect(seeded.getState().future).not.toBe(a.getState().future);
  });
});
