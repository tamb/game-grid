import GameGrid from '../index';
import { IOptions } from '../interfaces';
import { matrix } from '../__mocks__/matrix';

describe('GameGrid class constructor', () => {
  let renderedGrid: GameGrid;
  let defaultOptions: IOptions | null = null;

  beforeAll(() => {
    document.body.insertAdjacentHTML('afterbegin', '<div id="root"></div>');
  });

  beforeEach(() => {
    renderedGrid = new GameGrid({ matrix }, document.getElementById('root')!);
    defaultOptions = {
      arrowControls: true,
      clickable: true,
      wasdControls: false,
      infiniteX: false,
      infiniteY: false,
      rewindLimit: 20,
      blockOnType: ['barrier'],
      collideOnType: ['interactive'],
      moveOnType: ['open'],
    };
  });

  afterEach(() => {
    renderedGrid.destroy();
    renderedGrid = null!;
    defaultOptions = null;
  });

  // instantiation tests
  test('options are set correctly', () => {
    const fakeGrid = new GameGrid(
      {
        matrix,
        options: {
          infiniteX: false,
        },
      },
      document.getElementById('root')!,
    );

    expect(fakeGrid.getOptions().infiniteX).toBe(false);
  });

  test('default options exist', () => {
    expect(renderedGrid.options).toEqual(defaultOptions);
  });

  // test("handlers attach on instantiation", () => {});

  // // api tests
  // test("destroy removes event listeners", () => {});

  test('setMatrix applies given matrix and getMatrix gets', () => {
    renderedGrid.setMatrix([[{ type: 'open' }, { type: 'open' }]]);
    expect(renderedGrid.getMatrix().length).toBe(1);
    expect(renderedGrid.getMatrix()[0].length).toBe(2);
  });

  // // move API
  // TODO: finish this test
  test('getActiveCell returns active cell element', () => {
    const activeCell = renderedGrid.getActiveCell();

    expect(activeCell.current).toBeTruthy();
    expect(
      activeCell.current?.classList.contains('gamegrid__cell--active'),
    ).toBe(true);
  });

  test('activeCell contains all additional attributes', () => {
    const activeCell = renderedGrid.getActiveCell();

    expect(activeCell.foo).toBe('bar');
    expect(activeCell.foo2).toBe('bar2');
  });

  test('setActiveCell sets the active cell properly', () => {
    renderedGrid.setActiveCell(1, 1, 'UP');
    expect(
      renderedGrid
        .getActiveCell()
        .current?.classList.contains('gamegrid__cell--active'),
    ).toBe(true);
    expect(renderedGrid.getState().currentDirection).toBe('UP');
  });

  test('getPreviousCell returns previous cell element', () => {
    const prevCell = renderedGrid.getPreviousCell();

    expect(prevCell.current).toBeTruthy();
    expect(prevCell.current?.classList.contains('gamegrid__cell')).toBe(true);
  });
});
