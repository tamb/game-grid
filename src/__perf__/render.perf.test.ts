import GameGrid from '../index';
import { expectWithinBudget, makeOpenMatrix, measureMedian, mountRoot } from './helpers';

describe('render performance', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a 40×40 grid under budget', () => {
    const root = mountRoot();
    const median = measureMedian(
      () => {
        const grid = new GameGrid({ matrix: makeOpenMatrix(40, 40) }, root);
        expect(grid.refs.cells.length).toBe(40);
        expect(grid.refs.cells[0].length).toBe(40);
        expect(root.querySelectorAll('[data-gamegrid-ref="cell"]').length).toBe(1600);
        grid.destroy();
        root.replaceChildren();
        root.className = '';
      },
      1,
      3,
    );
    expectWithinBudget('render 40x40', median, 90);
  });

  it('refresh of a 40×40 grid stays under budget', () => {
    const root = mountRoot();
    const grid = new GameGrid({ matrix: makeOpenMatrix(40, 40) }, root);
    const median = measureMedian(
      () => {
        grid.refresh();
      },
      1,
      3,
    );
    expect(root.querySelectorAll('[data-gamegrid-ref="cell"]').length).toBe(1600);
    grid.destroy();
    expectWithinBudget('refresh 40x40', median, 80);
  });

  it('refreshCells of 200 tiles on a 20×20 grid stays under budget', () => {
    const root = mountRoot();
    const grid = new GameGrid({ matrix: makeOpenMatrix(20, 20) }, root);
    const cells: { coords: [number, number]; cell: { type: string } }[] = [];
    for (let i = 0; i < 200; i++) {
      cells.push({ coords: [i % 20, (i * 3) % 20], cell: { type: 'open' } });
    }
    const median = measureMedian(
      () => {
        grid.refreshCells(cells);
      },
      1,
      3,
    );
    expect(grid.getCell([0, 0]).type).toBe('open');
    grid.destroy();
    expectWithinBudget('refreshCells 200 on 20x20', median, 20);
  });

  it('zoomed first paint of an 80×80 world only mounts the window', () => {
    const root = mountRoot();
    const median = measureMedian(
      () => {
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
        expect(grid.refs.cells.length).toBe(80);
        expect(grid.refs.cells[0].length).toBe(80);
        expect(grid.refs.cells[0][0].current).toBeNull();
        expect(grid.refs.cells[10][10].current).not.toBeNull();
        grid.destroy();
        root.replaceChildren();
        root.className = '';
      },
      1,
      3,
    );
    expectWithinBudget('zoomed first paint 10x10 of 80x80', median, 20);
  });
});
