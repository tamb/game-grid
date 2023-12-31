/**
 * @jest-environment jsdom
 */

import GameGrid from './index';
import { IOptions, IState } from './interfaces';

const matrix = [
  [
    { type: 'open', cellAttributes: [['data-test', 'yankee']] },
    {
      type: 'open',
      cellAttributes: [
        ['data-butt', 'doody'],
        ['data-doody', 'butt'],
      ],
      renderFunction() {
        return document.createElement('input');
      },
    },
    { type: 'open' },
  ],
  [{ type: 'open' }, { type: 'open' }, { type: 'open' }],
  [{ type: 'open' }, { type: 'open' }, { type: 'open' }],
];

describe('GameGrid class', () => {
  let renderedGrid: GameGrid;
  let gridInMemory: GameGrid;
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
      rendered: false,
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

  test('container ref is always made', () => {
    expect(renderedGrid.refs.container!.id).toMatch('root');
  });

  test('refs are made', () => {
    renderedGrid.renderGrid(document.getElementById('root')!);
    expect(renderedGrid.refs.rows.length).toBe(3),
      expect(renderedGrid.refs.cells[0].length).toBe(3);
  });

  test('initial state defaults correctly', () => {
    expect(renderedGrid.getState()).toEqual(defaultState);
  });

  test('initial state accepts values', () => {
    const newState = {
      current_direction: 'up',
      active_coords: [1, 1],
    };
    const newGrid = new GameGrid(
      {
        matrix,
        // @ts-ignore
        state: newState,
      },
      document.getElementById('root')!,
    );

    expect(newGrid.getState()).toEqual({
      current_direction: 'up',
      rendered: false,
      prev_coords: [0, 0],
      active_coords: [1, 1],
      moves: [[0, 0]],
    });
  });
  test('move length initializes as 1', () => {
    expect(renderedGrid.getState().moves.length).toBe(1);
    // expect(workingGrid.getState()).toEqual(defaultState);
  });
  //internal workings
  test('move is added to moves', () => {
    renderedGrid.moveRight();
    renderedGrid.moveDown();
    expect(renderedGrid.getState().moves.length).toBe(3);
  });

  test('move length doesnt pass rewind limit', () => {
    const x = new GameGrid(
      {
        matrix,
        options: { rewind_limit: 2 },
      },
      document.getElementById('root')!,
    );
    x.moveRight();
    x.moveRight();
    expect(x.getState().moves.length).toBe(2);
  });
  // test("handlers attach on instantiation", () => {});
  // test("hitting limit fires events", () => {});
  // test("hitting interactive fires interactive", () => {});
  // test("hitting barrier fires barrier", () => {});
  // test("hitting custom type fires custom type event", () => {});

  // // api tests
  // test("destroy removes event listeners", () => {});

  test('getState return full state', () => {
    expect(renderedGrid.getState().moves.length).toBe(1);
    expect(renderedGrid.getState()).toEqual(defaultState);
  });

  test('setMatrix applies given matrix and getMatrix gets', () => {
    renderedGrid.setMatrix([[{ type: 'open' }, { type: 'open' }]]);
    expect(renderedGrid.getMatrix().length).toBe(1);
    expect(renderedGrid.getMatrix()[0].length).toBe(2);
  });

  test('setStateSync updates whole state correctly', () => {
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
    renderedGrid.setStateSync({ current_direction: 'blueberry' });
    expect(renderedGrid.getState().current_direction).toMatch('blueberry');
    expect(renderedGrid.getState().rendered).toBe(false);
  });

  // // move API
  // TODO: finish this test
  test('getActiveCell returns active cell element', () => {});

  test('moveLeft moves left', () => {
    const x = new GameGrid(
      {
        matrix,
      },
      document.getElementById('root')!,
    );
    x.moveLeft();
    const state = x.getState();
    expect(state.current_direction).toMatch('left');
    expect(state.prev_coords).toEqual([0, 0]);
    expect(state.active_coords).toEqual([0, x.getMatrix()[0].length - 1]);
    expect(state.next_coords).toEqual([0, x.getMatrix()[0].length - 1]);
  });

  test('moveRight moves right', () => {
    const x = new GameGrid(
      {
        matrix,
      },
      document.getElementById('root')!,
    );
    x.moveRight();
    const state = x.getState();
    expect(state.current_direction).toMatch('right');
    expect(state.prev_coords).toEqual([0, 0]);
    expect(state.active_coords).toEqual([0, 1]);
    expect(state.next_coords).toEqual([0, 1]);
  });

  test('moveUp moves up', () => {
    const x = new GameGrid(
      {
        matrix,
      },
      document.getElementById('root')!,
    );
    x.moveUp();
    const state = x.getState();
    expect(state.current_direction).toMatch('up');
    expect(state.prev_coords).toEqual([0, 0]);
    expect(state.active_coords).toEqual([x.getMatrix().length - 1, 0]);
    expect(state.next_coords).toEqual([x.getMatrix().length - 1, 0]);
  });

  test('moveDown moves down', () => {
    const x = new GameGrid(
      {
        matrix,
      },
      document.getElementById('root')!,
    );
    x.moveDown();
    const state = x.getState();
    expect(state.current_direction).toMatch('down');
    expect(state.prev_coords).toEqual([0, 0]);
    expect(state.active_coords).toEqual([1, 0]);
    expect(state.next_coords).toEqual([1, 0]);
  });

  // test("moveLeft unblocked goes left", () => {});
  // test("moveLeft blocked stays", () => {});
  // test("moveRight unblocked goes left", () => {});
  // test("moveRight blocked stays", () => {});
  // test("moveUp unblocked goes left", () => {});
  // test("moveUp blocked stays", () => {});
  // test("moveDown unblocked goes left", () => {});
  // test("moveDown blocked stays", () => {});

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
