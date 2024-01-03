import GameGrid from '../index';
import { matrix } from '../__mocks__/matrix';

describe('GameGrid rendering', () => {
  test('renderFunction fires', () => {
    const x = new GameGrid(
      {
        matrix,
      },
      document.getElementById('root')!,
    );
    expect(x.refs.cells[0][1].getAttribute('data-butt')).toBe('doody');
  });

  test('renderFunction returns HTMLElement', () => {
    const x = new GameGrid(
      {
        matrix,
      },
      document.getElementById('root')!,
    );
    expect(x.refs.cells[0][1].tagName).toBe('INPUT');
  });

  test('cellAttributes are set', () => {
    const x = new GameGrid(
      {
        matrix,
      },
      document.getElementById('root')!,
    );
    expect(x.refs.cells[0][1].getAttribute('data-test')).toBe('yankee');
  });

  test('cellAttributes are set', () => {
    const x = new GameGrid(
      {
        matrix,
      },
      document.getElementById('root')!,
    );
    expect(x.refs.cells[0][1].getAttribute('data-test')).toBe('yankee');
  });

  test('refs are set', () => {
    const x = new GameGrid(
      {
        matrix,
      },
      document.getElementById('root')!,
    );
    expect(x.refs.rows.length).toBe(3);
    expect(x.refs.cells.length).toBe(3);
    expect(x.refs.cells[0].length).toBe(3);
    expect(x.refs.container).toBe(document.getElementById('root')!);
  });
});
