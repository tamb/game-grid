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
        options: { rewindLimit: 2 },
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
    expect(state.currentDirection).toMatch('left');
    expect(state.prevCoords).toEqual([0, 0]);
    expect(state.activeCoords).toEqual([0, x.getMatrix()[0].length - 1]);
    expect(state.nextCoords).toEqual([0, x.getMatrix()[0].length - 1]);
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
    expect(state.currentDirection).toMatch('right');
    expect(state.prevCoords).toEqual([0, 0]);
    expect(state.activeCoords).toEqual([0, 1]);
    expect(state.nextCoords).toEqual([0, 1]);
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
    expect(state.currentDirection).toMatch('up');
    expect(state.prevCoords).toEqual([0, 0]);
    expect(state.activeCoords).toEqual([x.getMatrix().length - 1, 0]);
    expect(state.nextCoords).toEqual([x.getMatrix().length - 1, 0]);
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
    expect(state.currentDirection).toMatch('down');
    expect(state.prevCoords).toEqual([0, 0]);
    expect(state.activeCoords).toEqual([1, 0]);
    expect(state.nextCoords).toEqual([1, 0]);
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
