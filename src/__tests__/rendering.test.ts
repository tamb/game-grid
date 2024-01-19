import GameGrid from '../index';
import { matrix } from '../__mocks__/matrix';

describe('GameGrid rendering', () => {
  let renderedGrid: GameGrid;

  beforeAll(() => {
    document.body.insertAdjacentHTML('afterbegin', '<div id="root"></div>');
  });

  beforeEach(() => {
    renderedGrid = new GameGrid({ matrix }, document.getElementById('root')!);
  });

  afterEach(() => {
    renderedGrid.destroy();
    renderedGrid = null!;
  });

  test('renderFunction returns HTMLElement', () => {
    expect(renderedGrid.refs.cells[0][1].current?.tagName).toBe('DIV');
  });

  test('cellAttributes are set', () => {
    expect(
      renderedGrid.refs.cells[0][0].current?.getAttribute('data-test'),
    ).toBe('yankee');
  });

  test('refs are set', () => {
    expect(renderedGrid.refs.rows.length).toBe(3);
    expect(renderedGrid.refs.cells.length).toBe(3);
    expect(renderedGrid.refs.cells[0].length).toBe(3);
    expect(renderedGrid.refs.container).toBe(document.getElementById('root')!);
  });

  // // render tests
  test('container classes are applied', () => {
    expect(renderedGrid.refs.container?.classList.contains('gamegrid')).toBe(
      true,
    );
  });

  test('row classes are applied', () => {
    const rows = renderedGrid.refs.rows;
    expect(rows[0].current?.classList.contains('gamegrid__row')).toBe(true);
    expect(rows[1].current?.classList.contains('gamegrid__row')).toBe(true);
    expect(rows[2].current?.classList.contains('gamegrid__row')).toBe(true);
  });

  test('cell classes are applied', () => {
    const cells = renderedGrid.refs.cells;
    expect(cells[0][0].current?.classList.contains('gamegrid__cell')).toBe(
      true,
    );
    expect(cells[1][1].current?.classList.contains('gamegrid__cell')).toBe(
      true,
    );
    expect(cells[2][2].current?.classList.contains('gamegrid__cell')).toBe(
      true,
    );
  });

  test('cell width is correct', () => {
    const cells = renderedGrid.refs.cells;
    expect(cells[0][0].current?.style.width.substring(0, 4)).toMatch('33.3');
  });

  test('cell content renders', () => {
    const cells = renderedGrid.refs.cells;
    expect(cells[0][1].current?.querySelector('input')!.nodeName).toMatch(
      'INPUT',
    );
  });

  test('default row attributes rendered', () => {
    const rows = renderedGrid.refs.rows;
    expect(rows[0].current?.getAttribute('data-gamegrid-row-index')).toMatch(
      '0',
    );
  });

  test('default cell attributes are rendered', () => {
    const cells = renderedGrid.refs.cells;

    expect(cells[1][0].current?.getAttribute('data-gamegrid-coords')).toMatch(
      '0,1',
    );
  });

  test('cell custom attributes render', () => {
    const cells = renderedGrid.refs.cells;
    expect(cells[0][1].current?.getAttribute('data-butt')).toMatch('doody');
    expect(cells[0][1].current?.getAttribute('data-doody')).toMatch('butt');
  });
});
