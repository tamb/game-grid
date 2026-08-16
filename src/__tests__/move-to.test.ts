import { matrix } from '../__mocks__/matrix';
import GameGrid, { gridEventsEnum } from '../index';
import type { ICell } from '../interfaces';

function open(extra: Partial<ICell> = {}): ICell {
  return { type: 'open', ...extra };
}

function barrier(): ICell {
  return { type: 'barrier' };
}

describe('moveTo()', () => {
  test('walks to a single destination through setActiveCell', () => {
    const grid = new GameGrid({
      matrix,
      state: { activeCoords: [0, 0] },
    });
    grid.moveTo([0, 2]);
    expect(grid.getState().activeCoords).toEqual([0, 2]);
    expect(grid.getState().prevCoords).toEqual([0, 0]);
    expect(grid.getState().currentDirection).toBe('DOWN');
    expect(grid.getState().moves).toEqual([
      [0, 0],
      [0, 2],
    ]);
    grid.destroy();
  });

  test('walks an explicit path and records each landed cell', () => {
    const grid = new GameGrid({
      matrix,
      state: { activeCoords: [0, 0] },
    });
    grid.moveTo([
      [0, 1],
      [0, 2],
      [1, 2],
    ]);
    expect(grid.getState().activeCoords).toEqual([1, 2]);
    expect(grid.getState().moves).toEqual([
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ]);
    grid.destroy();
  });

  test('stops on a blocked step and does not continue the path', () => {
    const onBlock = vi.fn();
    const onLand = vi.fn();
    const grid = new GameGrid({
      matrix: [
        [open(), barrier(), open()],
        [open(), open(), open()],
      ],
      options: { callbacks: { onBlock, onLand } },
      state: { activeCoords: [0, 0] },
    });
    grid.moveTo([
      [1, 0],
      [2, 0],
    ]);
    expect(grid.getState().activeCoords).toEqual([0, 0]);
    expect(onBlock).toHaveBeenCalledTimes(1);
    expect(onLand).not.toHaveBeenCalled();
    expect(grid.getState().moves).toEqual([[0, 0]]);
    grid.destroy();
  });

  test('stops after a finite-edge clamp that does not reach the requested cell', () => {
    const grid = new GameGrid({
      matrix,
      options: { infiniteX: false, infiniteY: false },
      state: { activeCoords: [0, 0] },
    });
    grid.moveTo([
      [0, -1],
      [1, 0],
    ]);
    expect(grid.getState().activeCoords).toEqual([0, 0]);
    grid.destroy();
  });

  test('fires collide / land for each successful step', () => {
    const onCollide = vi.fn();
    const onLand = vi.fn();
    const grid = new GameGrid({
      matrix,
      options: { callbacks: { onCollide, onLand } },
      state: { activeCoords: [0, 1] },
    });
    grid.moveTo([
      [1, 1],
      [2, 1],
    ]);
    expect(onCollide).toHaveBeenCalledTimes(1);
    expect(onLand).toHaveBeenCalledTimes(2);
    expect(grid.getState().activeCoords).toEqual([2, 1]);
    grid.destroy();
  });

  test('does not dispatch directional MOVE_* events', () => {
    const target = new EventTarget();
    const directional: string[] = [];
    for (const name of [
      gridEventsEnum.MOVE_UP,
      gridEventsEnum.MOVE_RIGHT,
      gridEventsEnum.MOVE_DOWN,
      gridEventsEnum.MOVE_LEFT,
    ]) {
      target.addEventListener(name, () => directional.push(name));
    }
    const grid = new GameGrid({
      matrix,
      options: { eventTarget: target },
      state: { activeCoords: [0, 0] },
    });
    grid.moveTo([0, 1]);
    expect(directional).toEqual([]);
    expect(grid.getState().activeCoords).toEqual([0, 1]);
    grid.destroy();
  });

  test('skips the current cell and no-ops an empty path', () => {
    const onLand = vi.fn();
    const grid = new GameGrid({
      matrix,
      options: { callbacks: { onLand } },
      state: { activeCoords: [0, 0] },
    });
    grid.moveTo([0, 0]);
    grid.moveTo([]);
    expect(onLand).not.toHaveBeenCalled();
    expect(grid.getState().activeCoords).toEqual([0, 0]);
    grid.destroy();
  });

  test('is not rate-limited by moveDebounce', () => {
    vi.useFakeTimers();
    const grid = new GameGrid({
      matrix,
      options: { moveDebounce: 1000 },
      state: { activeCoords: [0, 0] },
    });
    grid.moveTo([
      [0, 1],
      [0, 2],
    ]);
    expect(grid.getState().activeCoords).toEqual([0, 2]);
    grid.destroy();
    vi.useRealTimers();
  });

  test('updates the active cell in the DOM', () => {
    document.body.innerHTML = '<div id="root"></div>';
    const container = document.getElementById('root')!;
    const grid = new GameGrid(
      {
        matrix,
        state: { activeCoords: [0, 0] },
      },
      container,
    );
    grid.moveTo([1, 2]);
    expect(grid.refs.cells[2][1].current?.classList.contains('gamegrid__cell--active')).toBe(true);
    expect(grid.refs.cells[0][0].current?.classList.contains('gamegrid__cell--active')).toBe(false);
    grid.destroy();
  });
});
