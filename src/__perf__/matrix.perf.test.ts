import GameGrid from '../index';
import { PERF_BUDGET_MS } from './budgets';
import { expectWithinBudget, makeOpenMatrix, makeTypedMatrix, measureMedian } from './helpers';

describe('matrix query performance', () => {
  it('getAllCellsByType on 80×80 stays under budget', () => {
    const grid = new GameGrid({ matrix: makeTypedMatrix(80, 80, 5) });
    let found = 0;
    const median = measureMedian(() => {
      found = grid.getAllCellsByType('barrier').length;
    });
    expect(found).toBeGreaterThan(0);
    expect(found).toBe(grid.getAllCellsByType('barrier').length);
    grid.destroy();
    expectWithinBudget(
      'getAllCellsByType 80x80',
      median,
      PERF_BUDGET_MS.matrix.getAllCellsByType80x80,
    );
  });

  it('setCell / getCell tight loop on 100×80 stays under budget', () => {
    const grid = new GameGrid({ matrix: makeOpenMatrix(80, 100) });
    const median = measureMedian(() => {
      for (let y = 0; y < 80; y++) {
        for (let x = 0; x < 100; x++) {
          const cell = grid.getCell([x, y]);
          grid.setCell([x, y], { type: cell.type });
        }
      }
    });
    expect(grid.getCell([99, 79]).type).toBe('open');
    grid.destroy();
    expectWithinBudget('setCell/getCell 8000 cells', median, PERF_BUDGET_MS.matrix.setGetCell8000);
  });
});
