import GameGrid from '../index';
import { IOptions, IState } from '../interfaces';
import { matrix } from '../__mocks__/matrix';

describe('Move methods', () => {
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

  // test("hitting limit fires events", () => {});
  // test("hitting interactive fires interactive", () => {});
  // test("hitting barrier fires barrier", () => {});
  // test("hitting custom type fires custom type event", () => {});
  // test("moveLeft unblocked goes left", () => {});
  // test("moveLeft blocked stays", () => {});
  // test("moveRight unblocked goes left", () => {});
  // test("moveRight blocked stays", () => {});
  // test("moveUp unblocked goes left", () => {});
  // test("moveUp blocked stays", () => {});
  // test("moveDown unblocked goes left", () => {});
  // test("moveDown blocked stays", () => {});
});
