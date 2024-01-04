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
    expect(renderedGrid.refs.cells[0][1].tagName).toBe('DIV');
  });

  test('cellAttributes are set', () => {
    expect(renderedGrid.refs.cells[0][0].getAttribute('data-test')).toBe(
      'yankee',
    );
  });

  test('refs are set', () => {
    expect(renderedGrid.refs.rows.length).toBe(3);
    expect(renderedGrid.refs.cells.length).toBe(3);
    expect(renderedGrid.refs.cells[0].length).toBe(3);
    expect(renderedGrid.refs.container).toBe(document.getElementById('root')!);
  });

  // // render tests
  test('container classes are applied', () => {
    renderedGrid.renderGrid(document.getElementById('root')!);
    expect(renderedGrid.refs.container!.classList.contains('gamegrid')).toBe(
      true,
    );
  });

  test('row classes are applied', () => {
    renderedGrid.renderGrid(document.getElementById('root')!);
    const rows = renderedGrid.refs.rows;
    expect(rows[0].classList.contains('gamegrid__row')).toBe(true);
    expect(rows[1].classList.contains('gamegrid__row')).toBe(true);
    expect(rows[2].classList.contains('gamegrid__row')).toBe(true);
  });

  test('cell classes are applied', () => {
    renderedGrid.renderGrid(document.getElementById('root')!);
    const cells = renderedGrid.refs.cells;
    expect(cells[0][0].classList.contains('gamegrid__cell')).toBe(true);
    expect(cells[1][1].classList.contains('gamegrid__cell')).toBe(true);
    expect(cells[2][2].classList.contains('gamegrid__cell')).toBe(true);
  });

  test('cell width is correct', () => {
    renderedGrid.renderGrid(document.getElementById('root')!);
    const cells = renderedGrid.refs.cells;
    expect(cells[0][0].style.width.substring(0, 4)).toMatch('33.3');
  });

  test('cell content renders', () => {
    renderedGrid?.renderGrid(document.getElementById('root')!);
    const cells = renderedGrid.refs.cells;
    expect(cells[0][1].querySelector('input')!.nodeName).toMatch('INPUT');
  });

  test('default row attributes rendered', () => {
    renderedGrid?.renderGrid(document.getElementById('root')!);
    const rows = renderedGrid.refs.rows;
    expect(rows[0].getAttribute('data-gamegrid-row-index')).toMatch('0');
  });

  test('default cell attributes are rendered', () => {
    renderedGrid?.renderGrid(document.getElementById('root')!);
    const cells = renderedGrid.refs.cells;
    expect(cells[0][0].getAttribute('data-gamegrid-row-index')).toMatch('0');
    ``;
    expect(cells[1][0].getAttribute('data-gamegrid-row-index')).toMatch('1');
    expect(cells[1][1].getAttribute('data-gamegrid-col-index')).toMatch('1');
    expect(cells[1][0].getAttribute('data-gamegrid-coords')).toMatch('1,0');
  });

  test('cell custom attributes render', () => {
    renderedGrid?.renderGrid(document.getElementById('root')!);
    const cells = renderedGrid.refs.cells;
    expect(cells[0][1].getAttribute('data-butt')).toMatch('doody');
    expect(cells[0][1].getAttribute('data-doody')).toMatch('butt');
  });
});
