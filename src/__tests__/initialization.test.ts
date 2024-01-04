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
      active_class: 'gamegrid__cell--active',
      arrow_controls: true,
      clickable: true,
      wasd_controls: true,
      infinite_x: true,
      infinite_y: true,
      rewind_limit: 20,
      block_on_type: ['barrier'],
      collide_on_type: ['interactive'],
      move_on_type: ['open'],
    };
    defaultState = {
      active_coords: [0, 0],
      prev_coords: [0, 0],
      next_coords: [],
      current_direction: '',
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
          infinite_x: false,
        },
      },
      document.getElementById('root')!,
    );

    expect(fakeGrid.getOptions().infinite_x).toBe(false);
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
  test('getActiveCell returns active cell element', () => {});
});
