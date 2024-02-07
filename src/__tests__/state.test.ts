import GameGrid from '../index';
import { matrix } from '../__mocks__/matrix';
import { IState } from '../interfaces';

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
      currentDirection: 'DOWN',
    };

    renderedGrid = new GameGrid(
      {
        matrix,
      },
      document.getElementById('root')!,
    );
  });

  test('pre middleware fires', () => {
    const pre = jest.fn();
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
    const post = jest.fn();
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
    const pre = jest.fn();
    const post = jest.fn();
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
    expect(pre.mock.invocationCallOrder[0]).toBeLessThan(
      post.mock.invocationCallOrder[0],
    );
  });

  test('multiple pre and post middleware fire in order', () => {
    const pre1 = jest.fn();
    const pre2 = jest.fn();
    const post1 = jest.fn();
    const post2 = jest.fn();
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
    expect(pre1.mock.invocationCallOrder[0]).toBeLessThan(
      pre2.mock.invocationCallOrder[0],
    );
    expect(pre2.mock.invocationCallOrder[0]).toBeLessThan(
      post1.mock.invocationCallOrder[0],
    );
    expect(post1.mock.invocationCallOrder[0]).toBeLessThan(
      post2.mock.invocationCallOrder[0],
    );
  });

  test('setStateSync updates whole state correctly', () => {
    const newState = {
      activeCoords: [0, 0],
      prevCoords: [0, 0],
      rendered: true,
      moves: [[0, 0]],
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
});
