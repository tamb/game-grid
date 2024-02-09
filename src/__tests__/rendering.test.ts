import GameGrid from '../index';
import { matrix } from '../__mocks__/matrix';

describe('GameGrid rendering', () => {
  let renderedGrid: GameGrid;
  let withClasses: GameGrid;

  beforeAll(() => {
    document.body.insertAdjacentHTML('afterbegin', '<div id="root"></div>');
    document.body.insertAdjacentHTML('afterbegin', '<div id="root2"></div>');
    document.body.insertAdjacentHTML('afterbegin', '<div id="root3"></div>');
  });

  beforeEach(() => {
    renderedGrid = new GameGrid({ matrix }, document.getElementById('root')!);
    withClasses = new GameGrid(
      {
        matrix,
        options: {
          cellClasses: ['foo', 'foo-2'],
          rowClasses: ['bar', 'bar-2'],
          containerClasses: ['buzz', 'buzz-2'],
          activeClasses: ['baz', 'baz-2'],
        },
        state: {
          activeCoords: [0, 0],
        },
      },
      document.getElementById('root2')!,
    );
  });

  afterEach(() => {
    renderedGrid.destroy();
    renderedGrid = null!;
    document.querySelector('#root')!.innerHTML = '';
    document.querySelector('#root2')!.innerHTML = '';
    document.querySelector('#root3')!.innerHTML = '';
  });

  test('Unrendered Grid has rendered state as false', () => {
    const _memoryGrid = new GameGrid({ matrix });
    // _memoryGrid.render(document.getElementById('root3')!);
    expect(_memoryGrid.getState().rendered).toBe(false);
  });

  test('Rendering grid sets rendered state to true', () => {
    const _memoryGrid = new GameGrid({ matrix });
    _memoryGrid.render(document.getElementById('root3')!);
    expect(_memoryGrid.getState().rendered).toBe(true);
  });

  test('Rendering grid sets refs correctly', () => {
    const _memoryGrid = new GameGrid({ matrix });
    _memoryGrid.render(document.getElementById('root3')!);
    expect(_memoryGrid.refs.container).toBe(document.getElementById('root3')!);
    expect(_memoryGrid.refs.rows.length).toBe(3);
    expect(_memoryGrid.refs.cells.length).toBe(3);
  });

  test('Rendered Grid has rendered state as true', () => {
    expect(renderedGrid.getState().rendered).toBe(true);
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

  test('custom container classes are applied', () => {
    expect(withClasses.refs.container?.classList.contains('buzz')).toBe(true);
    expect(withClasses.refs.container?.classList.contains('buzz-2')).toBe(true);
  });

  test('row classes are applied', () => {
    const rows = renderedGrid.refs.rows;
    expect(rows[0].current?.classList.contains('gamegrid__row')).toBe(true);
    expect(rows[1].current?.classList.contains('gamegrid__row')).toBe(true);
    expect(rows[2].current?.classList.contains('gamegrid__row')).toBe(true);
  });
  test('custom row classes are applied', () => {
    expect(withClasses.refs.rows[0].current?.classList.contains('bar')).toBe(
      true,
    );
    expect(withClasses.refs.rows[1].current?.classList.contains('bar')).toBe(
      true,
    );
    expect(withClasses.refs.rows[2].current?.classList.contains('bar')).toBe(
      true,
    );
    expect(withClasses.refs.rows[0].current?.classList.contains('bar-2')).toBe(
      true,
    );
    expect(withClasses.refs.rows[1].current?.classList.contains('bar-2')).toBe(
      true,
    );
    expect(withClasses.refs.rows[2].current?.classList.contains('bar-2')).toBe(
      true,
    );
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

  test('custom classes are applied to cells', () => {
    expect(
      withClasses.refs.cells[0][0].current?.classList.contains('foo'),
    ).toBe(true);
    expect(
      withClasses.refs.cells[1][1].current?.classList.contains('foo'),
    ).toBe(true);
    expect(
      withClasses.refs.cells[0][0].current?.classList.contains('foo-2'),
    ).toBe(true);
    expect(
      withClasses.refs.cells[1][1].current?.classList.contains('foo-2'),
    ).toBe(true);
  });

  test('Custom active cell classes are applied', () => {
    expect(
      withClasses.refs.cells[0][0].current?.classList.contains('baz'),
    ).toBe(true);
    expect(
      withClasses.refs.cells[0][0].current?.classList.contains('baz-2'),
    ).toBe(true);
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

  test('move direction class is added to Grid', () => {
    renderedGrid.moveUp();
    expect(
      renderedGrid.refs.container?.classList.contains(
        'gamegrid__direction--up',
      ),
    ).toBeTruthy();
  });
});
