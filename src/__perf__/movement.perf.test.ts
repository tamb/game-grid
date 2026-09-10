import GameGrid, { classesEnum } from '../index';
import {
  countActiveCells,
  expectWithinBudget,
  makeOpenMatrix,
  measureMedian,
  mountRoot,
  zigzagMoves,
} from './helpers';

/**
 * Movement budgets assume O(1) active-cell painting. A full-grid class scan
 * on a 30×30 mounted grid for 400 moves was ~700ms here; the move-only
 * budget below will fail if that scan returns.
 */

describe('movement performance', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('headless 80×80 completes 3000 zigzag moves under budget', () => {
    const median = measureMedian(() => {
      const grid = new GameGrid({ matrix: makeOpenMatrix(80, 80) });
      zigzagMoves(grid, 3000);
      expect(grid.getState().activeCoords).toEqual([0, 0]);
      grid.destroy();
    });
    expectWithinBudget('headless 80x80 x 3000 moves', median, 40);
  });

  it('headless 80×80 with region tracking completes 2000 moves under budget', () => {
    const median = measureMedian(() => {
      const grid = new GameGrid({
        matrix: makeOpenMatrix(80, 80),
        options: { regionDivisions: 4 },
      });
      zigzagMoves(grid, 2000);
      expect(grid.getState().activeCoords).toEqual([0, 0]);
      expect(grid.getActiveRegion()?.divisions).toBe(4);
      grid.destroy();
    });
    expectWithinBudget('headless region 80x80 x 2000 moves', median, 40);
  });

  it('rendered 30×30 completes 400 zigzag moves without scanning the grid', () => {
    const root = mountRoot();
    const median = measureMedian(
      () => {
        const grid = new GameGrid({ matrix: makeOpenMatrix(30, 30) }, root);
        zigzagMoves(grid, 400);
        expect(grid.getState().activeCoords).toEqual([0, 0]);
        expect(countActiveCells(root)).toBe(1);
        expect(grid.refs.cells[0][0].current?.classList.contains(classesEnum.ACTIVE_CELL)).toBe(
          true,
        );
        grid.destroy();
        root.replaceChildren();
        root.className = '';
      },
      1,
      3,
    );
    expectWithinBudget('rendered 30x30 x 400 moves', median, 120);
  });

  it('move-only cost on a mounted 30×30 stays well below a full-grid class scan', () => {
    const root = mountRoot();
    const grid = new GameGrid({ matrix: makeOpenMatrix(30, 30) }, root);
    zigzagMoves(grid, 8);

    const median = measureMedian(
      () => {
        zigzagMoves(grid, 400);
      },
      1,
      5,
    );

    expect(grid.getState().activeCoords).toEqual([0, 0]);
    expect(countActiveCells(root)).toBe(1);
    grid.destroy();
    expectWithinBudget('mounted 30x30 move-only 400', median, 40);
  });

  it('zoomed 10×10 window on an 80×80 matrix keeps move cost independent of world size', () => {
    const root = mountRoot();
    const grid = new GameGrid(
      {
        matrix: makeOpenMatrix(80, 80),
        state: {
          activeCoords: [10, 10],
          zoom: { minX: 10, minY: 10, maxX: 19, maxY: 19 },
        },
      },
      root,
    );

    expect(root.querySelectorAll('[data-gamegrid-ref="cell"]').length).toBe(100);

    const median = measureMedian(
      () => {
        zigzagMoves(grid, 400);
      },
      1,
      5,
    );

    expect(grid.getState().activeCoords).toEqual([10, 10]);
    expect(countActiveCells(root)).toBe(1);
    grid.destroy();
    expectWithinBudget('zoomed 80x80 world / 10x10 window x 400 moves', median, 40);
  });

  it('moveTo along a 200-step path stays under budget', () => {
    const median = measureMedian(() => {
      const grid = new GameGrid({ matrix: makeOpenMatrix(50, 50) });
      const path: [number, number][] = [];
      for (let i = 0; i < 200; i++) {
        path.push([i % 50, Math.floor(i / 50)]);
      }
      grid.moveTo(path);
      expect(grid.getState().activeCoords).toEqual([49, 3]);
      grid.destroy();
    });
    expectWithinBudget('moveTo 200-step path', median, 8);
  });

  it('rewind / unrewind cycles stay under budget', () => {
    const median = measureMedian(() => {
      const grid = new GameGrid({
        matrix: makeOpenMatrix(20, 20),
        options: { rewindLimit: 40 },
      });
      zigzagMoves(grid, 80);
      for (let i = 0; i < 500; i++) {
        grid.rewind(5);
        grid.unrewind(5);
      }
      grid.destroy();
    });
    expectWithinBudget('rewind/unrewind 500 cycles', median, 25);
  });
});
