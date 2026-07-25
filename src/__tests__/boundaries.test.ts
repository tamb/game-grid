import { matrix } from '../__mocks__/matrix';
import GameGrid, { gridEventsEnum } from '../index';

describe('boundary and wrap behavior', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('onBoundaryX fires when moving past the right edge', () => {
    const onBoundaryX = vi.fn();
    const grid = new GameGrid({
      matrix,
      options: { callbacks: { onBoundaryX } },
      state: { activeCoords: [2, 0] },
    });
    grid.moveRight();
    expect(onBoundaryX).toHaveBeenCalled();
    expect(grid.getState().activeCoords).toEqual([2, 0]);
    grid.destroy();
  });

  test('onBoundaryY fires when moving past the bottom edge', () => {
    const onBoundaryY = vi.fn();
    const grid = new GameGrid({
      matrix,
      options: { callbacks: { onBoundaryY } },
      state: { activeCoords: [0, 2] },
    });
    grid.moveDown();
    expect(onBoundaryY).toHaveBeenCalled();
    expect(grid.getState().activeCoords).toEqual([0, 2]);
    grid.destroy();
  });

  test('infiniteX wraps from the right edge to the left', () => {
    const onWrapX = vi.fn();
    const grid = new GameGrid({
      matrix,
      options: { infiniteX: true, callbacks: { onWrapX } },
      state: { activeCoords: [2, 1] },
    });
    grid.moveRight();
    expect(grid.getState().activeCoords).toEqual([0, 1]);
    expect(onWrapX).toHaveBeenCalled();
    grid.destroy();
  });

  test('infiniteY wraps from the top edge to the bottom', () => {
    const onWrapY = vi.fn();
    const grid = new GameGrid({
      matrix,
      options: { infiniteY: true, callbacks: { onWrapY } },
      state: { activeCoords: [1, 0] },
    });
    grid.moveUp();
    expect(grid.getState().activeCoords).toEqual([1, 2]);
    expect(onWrapY).toHaveBeenCalled();
    grid.destroy();
  });

  test('infiniteY wraps from the bottom edge to the top', () => {
    const grid = new GameGrid({
      matrix,
      options: { infiniteY: true },
      state: { activeCoords: [1, 2] },
    });
    grid.moveDown();
    expect(grid.getState().activeCoords).toEqual([1, 0]);
    grid.destroy();
  });

  test('axis-specific wrap events are dispatched', () => {
    const events: string[] = [];
    const target = new EventTarget();
    for (const name of [gridEventsEnum.WRAP_X, gridEventsEnum.WRAP_Y]) {
      target.addEventListener(name, () => events.push(name));
    }
    const grid = new GameGrid({
      matrix,
      options: { infiniteX: true, infiniteY: true, eventTarget: target },
      state: { activeCoords: [0, 0] },
    });
    grid.moveLeft();
    grid.moveUp();
    expect(events).toContain(gridEventsEnum.WRAP_X);
    expect(events).toContain(gridEventsEnum.WRAP_Y);
    grid.destroy();
  });
});
