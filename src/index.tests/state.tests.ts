import GameGrid from '../index';
import { matrix } from './__mocks__';

describe('setStateSync', () => {
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
});
