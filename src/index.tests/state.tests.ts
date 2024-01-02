import GameGrid from '../index';
import { matrix } from './__mocks__';

describe('setStateSync', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
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
    const renderedGrid = new GameGrid(
      {
        matrix,
      },
      document.getElementById('root')!,
    );
    const newState = {
      active_coords: [0, 0],
      prev_coords: [0, 0],
      current_direction: '',
      rendered: false,
      moves: [[0, 0]],
    };
    renderedGrid.setStateSync(newState);
    expect(renderedGrid.getState()).toEqual(newState);
  });

  test('setStateSync updates partial state correctly', () => {
    const renderedGrid = new GameGrid(
      {
        matrix,
      },
      document.getElementById('root')!,
    );
    renderedGrid.setStateSync({ current_direction: 'blueberry' });
    expect(renderedGrid.getState().current_direction).toMatch('blueberry');
    expect(renderedGrid.getState().rendered).toBe(false);
  });
});
