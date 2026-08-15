import { matrix } from '../__mocks__/matrix';
import GameGrid, { gridEventsEnum } from '../index';
import type { GameGridDOMEvent, ICellRefresh } from '../interfaces';

describe('refreshCells', () => {
  let mount: HTMLDivElement;

  beforeEach(() => {
    mount = document.createElement('div');
    document.body.appendChild(mount);
  });

  afterEach(() => {
    mount.remove();
    document.body.innerHTML = '';
  });

  test('writes cell data and patches that node without rebuilding the grid', () => {
    const grid = new GameGrid({ matrix }, mount);
    const untouched = mount.querySelector('[data-gamegrid-coords="0,0"]');
    const target = mount.querySelector('[data-gamegrid-coords="2,0"]');

    grid.refreshCells({ coords: [2, 0], cell: { type: 'open' } });

    expect(grid.getCell([2, 0]).type).toBe('open');
    expect(grid.getMatrix()[0][2].type).toBe('open');
    expect(mount.querySelector('[data-gamegrid-coords="2,0"]')).not.toBe(target);
    expect(
      mount.querySelector('[data-gamegrid-coords="2,0"]')?.getAttribute('data-gamegrid-cell-type'),
    ).toBe('open');
    expect(mount.querySelector('[data-gamegrid-coords="0,0"]')).toBe(untouched);
    expect(mount.querySelectorAll('[data-gamegrid-ref="cell"]').length).toBe(9);
    grid.destroy();
  });

  test('accepts an array and updates each cell', () => {
    const grid = new GameGrid({ matrix }, mount);

    grid.refreshCells([
      { coords: [2, 0], cell: { type: 'open' } },
      { coords: [1, 1], cell: { type: 'barrier' } },
    ]);

    expect(grid.getCell([2, 0]).type).toBe('open');
    expect(grid.getCell([1, 1]).type).toBe('barrier');
    expect(
      mount.querySelector('[data-gamegrid-coords="2,0"]')?.getAttribute('data-gamegrid-cell-type'),
    ).toBe('open');
    expect(
      mount.querySelector('[data-gamegrid-coords="1,1"]')?.getAttribute('data-gamegrid-cell-type'),
    ).toBe('barrier');
    grid.destroy();
  });

  test('omitting cell re-renders from current matrix data', () => {
    const grid = new GameGrid({ matrix }, mount);
    const next = {
      type: 'barrier',
      render() {
        const span = document.createElement('span');
        span.className = 'patched';
        return span;
      },
    };
    grid.setCell([0, 2], next);
    expect(
      mount.querySelector('[data-gamegrid-coords="0,2"]')?.querySelector('.patched'),
    ).toBeNull();

    grid.refreshCells({ coords: [0, 2] });

    expect(
      mount.querySelector('[data-gamegrid-coords="0,2"]')?.querySelector('.patched'),
    ).toBeTruthy();
    expect(
      mount.querySelector('[data-gamegrid-coords="0,2"]')?.getAttribute('data-gamegrid-cell-type'),
    ).toBe('barrier');
    grid.destroy();
  });

  test('keeps active highlighting when the active cell is refreshed', () => {
    const grid = new GameGrid(
      {
        matrix,
        options: { activeClasses: ['extra-active'] },
        state: { activeCoords: [1, 1] },
      },
      mount,
    );

    grid.refreshCells({ coords: [1, 1], cell: { type: 'open' } });

    const active = mount.querySelector('[data-gamegrid-coords="1,1"]');
    expect(active?.classList.contains('gamegrid__cell--active')).toBe(true);
    expect(active?.classList.contains('extra-active')).toBe(true);
    grid.destroy();
  });

  test('makes a former barrier walkable after the matrix write', () => {
    const grid = new GameGrid({ matrix, state: { activeCoords: [1, 0] } }, mount);
    grid.moveRight();
    expect(grid.getState().activeCoords).toEqual([1, 0]);

    grid.refreshCells({ coords: [2, 0], cell: { type: 'open' } });
    grid.moveRight();

    expect(grid.getState().activeCoords).toEqual([2, 0]);
    grid.destroy();
  });

  test('updates matrix headless and does not throw', () => {
    const grid = new GameGrid({ matrix });
    grid.refreshCells({ coords: [2, 0], cell: { type: 'open' } });
    expect(grid.getCell([2, 0]).type).toBe('open');
    grid.destroy();
  });

  test('emits CELLS_REFRESHED with the processed cells', () => {
    const target = new EventTarget();
    const seen: ICellRefresh[][] = [];
    target.addEventListener(gridEventsEnum.CELLS_REFRESHED, (event: Event) => {
      const detail = (event as GameGridDOMEvent).detail;
      seen.push(detail.cells as ICellRefresh[]);
    });
    const grid = new GameGrid({ matrix, options: { eventTarget: target } }, mount);
    const next = { type: 'open' };

    grid.refreshCells({ coords: [2, 0], cell: next });

    expect(seen).toHaveLength(1);
    expect(seen[0]).toEqual([{ coords: [2, 0], cell: next }]);
    grid.destroy();
  });

  test('skips DOM for cells outside the zoom window', () => {
    const grid = new GameGrid({ matrix, state: { activeCoords: [0, 0] } }, mount);
    grid.setZoom({ minX: 0, minY: 0, maxX: 1, maxY: 1 }, { animate: false });
    expect(mount.querySelector('[data-gamegrid-coords="2,2"]')).toBeNull();

    grid.refreshCells({ coords: [2, 2], cell: { type: 'barrier' } });

    expect(grid.getCell([2, 2]).type).toBe('barrier');
    expect(grid.refs.cells[2][2].current).toBeNull();
    expect(mount.querySelector('[data-gamegrid-coords="2,2"]')).toBeNull();
    expect(
      mount.querySelector('[data-gamegrid-coords="0,0"]')?.getAttribute('data-gamegrid-cell-type'),
    ).toBe('open');
    grid.destroy();
  });
});
