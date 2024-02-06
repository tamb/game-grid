import GameGrid from '../index';
import { matrix } from '../__mocks__/matrix';

describe('Move methods', () => {
  let renderedGrid: GameGrid;

  beforeAll(() => {
    document.body.insertAdjacentHTML('afterbegin', '<div id="root"></div>');
  });

  beforeEach(() => {
    renderedGrid = new GameGrid(
      {
        matrix,
        state: {
          activeCoords: [1, 1],
        },
      },
      document.getElementById('root')!,
    );
  });

  afterEach(() => {
    renderedGrid.destroy();
    renderedGrid = null!;
  });

  test('move length initializes as 1', () => {
    expect(renderedGrid.getState().moves?.length).toBe(1);
  });

  test('move is added to moves', () => {
    renderedGrid.moveRight();
    renderedGrid.moveDown();
    expect(renderedGrid.getState().moves?.length).toBe(3);
  });

  test('move length doesnt pass rewind limit', () => {
    const x = new GameGrid(
      {
        matrix,
        options: { rewindLimit: 2 },
        state: {
          activeCoords: [1, 0],
        },
      },
      document.getElementById('root')!,
    );
    x.moveRight();
    x.moveRight();
    expect(x.getState().moves?.length).toBe(2);
  });

  test('moveLeft moves left', () => {
    renderedGrid.moveLeft();
    const state = renderedGrid.getState();
    expect(state.prevCoords).toEqual([1, 1]);
    expect(state.activeCoords).toEqual([0, 1]);
  });

  test('moveRight moves right', () => {
    renderedGrid.moveRight();
    const state = renderedGrid.getState();
    expect(state.prevCoords).toEqual([1, 1]);
    expect(state.activeCoords).toEqual([2, 1]);
  });

  test('moveUp moves up', () => {
    renderedGrid.moveUp();
    const state = renderedGrid.getState();
    expect(state.prevCoords).toEqual([1, 1]);
    expect(state.activeCoords).toEqual([1, 0]);
  });

  test('moveDown moves down', () => {
    renderedGrid.moveDown();
    const state = renderedGrid.getState();
    expect(state.prevCoords).toEqual([1, 1]);
    expect(state.activeCoords).toEqual([1, 2]);
  });

  test('Moving on right side edge works', () => {
    expect(renderedGrid.getState().activeCoords).toEqual([1, 1]);
    renderedGrid.moveRight();
    renderedGrid.moveDown();
    expect(renderedGrid.getState().activeCoords).toEqual([2, 2]);
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
