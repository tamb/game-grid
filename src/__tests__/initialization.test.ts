import GameGrid from '../index';
import { IOptions, IState } from '../interfaces';
import { matrix } from '../__mocks__/matrix';

describe('GameGrid class constructor', () => {
  let renderedGrid: GameGrid;
  let defaultOptions: IOptions | null = null;
  let defaultState: IState | null = null;

  beforeAll(() => {
    document.body.insertAdjacentHTML('afterbegin', '<div id="root"></div>');
  });

  beforeEach(() => {
    renderedGrid = new GameGrid({ matrix }, document.getElementById('root')!);
    defaultOptions = {
      activeClass: 'gamegrid__cell--active',
      arrowControls: true,
      clickable: true,
      wasdControls: true,
      infiniteX: true,
      infiniteY: true,
      rewindLimit: 20,
      blockOnType: ['barrier'],
      collideOnType: ['interactive'],
      moveOnType: ['open'],
    };
    defaultState = {
      activeCoords: [0, 0],
      prevCoords: [0, 0],
      nextCoords: [],
      currentDirection: '',
      rendered: true,
      moves: [[0, 0]],
    };
  });

  afterEach(() => {
    renderedGrid.destroy();
    renderedGrid = null!;
    defaultOptions = null;
    defaultState = null;
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

  test("setActiveCell sets the active cell properly", () => {
    renderedGrid.setActiveCell(1,1);
    expect(renderedGrid.getActiveCell().current?.classList.contains('gamegrid__cell--active')).toBe(true);
  });
});
