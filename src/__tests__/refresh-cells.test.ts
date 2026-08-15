import { matrix } from '../__mocks__/matrix';
import GameGrid, { gridEventsEnum } from '../index';
import type { GameGridDOMEvent, ICell, ICellRefresh } from '../interfaces';

function cloneMatrix(): ICell[][] {
  return matrix.map((row) => row.map((cell) => ({ ...cell })));
}

describe('setCell → refreshCells flow', () => {
  let mount: HTMLDivElement;

  beforeEach(() => {
    mount = document.createElement('div');
    document.body.appendChild(mount);
  });

  afterEach(() => {
    mount.remove();
    document.body.innerHTML = '';
  });

  test('setCell writes matrix by reference and leaves DOM, refs, and events alone', () => {
    const target = new EventTarget();
    const events: string[] = [];
    target.addEventListener(gridEventsEnum.CELLS_REFRESHED, () => {
      events.push(gridEventsEnum.CELLS_REFRESHED);
    });
    const grid = new GameGrid({ matrix: cloneMatrix(), options: { eventTarget: target } }, mount);
    const next = { type: 'barrier' };
    const node = mount.querySelector('[data-gamegrid-coords="1,0"]');
    const beforeType = node?.getAttribute('data-gamegrid-cell-type');
    const beforeRef = grid.refs.cells[0][1];

    grid.setCell([1, 0], next);

    expect(grid.getCell([1, 0])).toBe(next);
    expect(grid.getMatrix()[0][1]).toBe(next);
    expect(node?.getAttribute('data-gamegrid-cell-type')).toBe(beforeType);
    expect(grid.refs.cells[0][1]).toBe(beforeRef);
    expect(grid.refs.cells[0][1]).not.toBe(next);
    expect(events).toEqual([]);
    grid.destroy();
  });

  test('movement reads the new type immediately after setCell, before any refresh', () => {
    const grid = new GameGrid({ matrix: cloneMatrix(), state: { activeCoords: [1, 0] } }, mount);
    grid.moveRight();
    expect(grid.getState().activeCoords).toEqual([1, 0]);

    grid.setCell([2, 0], { type: 'open' });
    expect(
      mount.querySelector('[data-gamegrid-coords="2,0"]')?.getAttribute('data-gamegrid-cell-type'),
    ).toBe('barrier');

    grid.moveRight();
    expect(grid.getState().activeCoords).toEqual([2, 0]);
    grid.destroy();
  });

  test('refreshCells after setCell paints that node and updates refs', () => {
    const grid = new GameGrid({ matrix: cloneMatrix() }, mount);
    const next = {
      type: 'barrier',
      cellAttributes: [['data-door', 'closed']],
      render() {
        const span = document.createElement('span');
        span.className = 'patched';
        return span;
      },
    };
    const previousNode = mount.querySelector('[data-gamegrid-coords="0,2"]');
    const sibling = mount.querySelector('[data-gamegrid-coords="1,2"]');

    grid.setCell([0, 2], next);
    expect(previousNode?.querySelector('.patched')).toBeNull();

    grid.refreshCells({ coords: [0, 2] });

    const painted = mount.querySelector('[data-gamegrid-coords="0,2"]');
    expect(painted).not.toBe(previousNode);
    expect(painted?.getAttribute('data-gamegrid-cell-type')).toBe('barrier');
    expect(painted?.getAttribute('data-door')).toBe('closed');
    expect(painted?.querySelector('.patched')).toBeTruthy();
    expect(grid.refs.cells[2][0].type).toBe('barrier');
    expect(grid.refs.cells[2][0].current).toBe(painted);
    expect(mount.querySelector('[data-gamegrid-coords="1,2"]')).toBe(sibling);
    grid.destroy();
  });

  test('refreshCells with cell is the one-step write + paint', () => {
    const grid = new GameGrid({ matrix: cloneMatrix() }, mount);
    const next = { type: 'open' };
    const previousNode = mount.querySelector('[data-gamegrid-coords="2,0"]');

    grid.refreshCells({ coords: [2, 0], cell: next });

    expect(grid.getCell([2, 0])).toBe(next);
    expect(mount.querySelector('[data-gamegrid-coords="2,0"]')).not.toBe(previousNode);
    expect(
      mount.querySelector('[data-gamegrid-coords="2,0"]')?.getAttribute('data-gamegrid-cell-type'),
    ).toBe('open');
    expect(grid.refs.cells[0][2].type).toBe('open');
    grid.destroy();
  });

  test('refreshCells accepts an array and updates each cell', () => {
    const grid = new GameGrid({ matrix: cloneMatrix() }, mount);

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

  test('emits CELLS_REFRESHED once and does not emit RENDERED', () => {
    const target = new EventTarget();
    const events: string[] = [];
    const seen: ICellRefresh[][] = [];
    target.addEventListener(gridEventsEnum.CELLS_REFRESHED, (event: Event) => {
      events.push(gridEventsEnum.CELLS_REFRESHED);
      seen.push((event as GameGridDOMEvent).detail.cells as ICellRefresh[]);
    });
    target.addEventListener(gridEventsEnum.RENDERED, () => {
      events.push(gridEventsEnum.RENDERED);
    });
    const grid = new GameGrid({ matrix: cloneMatrix(), options: { eventTarget: target } }, mount);
    const next = { type: 'open' };
    events.length = 0;

    grid.refreshCells([{ coords: [2, 0], cell: next }, { coords: [0, 2] }]);

    expect(events).toEqual([gridEventsEnum.CELLS_REFRESHED]);
    expect(seen).toEqual([
      [
        { coords: [2, 0], cell: next },
        { coords: [0, 2], cell: grid.getCell([0, 2]) },
      ],
    ]);
    grid.destroy();
  });

  test('keeps active highlighting when the active cell is refreshed', () => {
    const grid = new GameGrid(
      {
        matrix: cloneMatrix(),
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

  test('updates matrix headless, emits, and does not throw', () => {
    const target = new EventTarget();
    let emitted = false;
    target.addEventListener(gridEventsEnum.CELLS_REFRESHED, () => {
      emitted = true;
    });
    const grid = new GameGrid({ matrix: cloneMatrix(), options: { eventTarget: target } });

    grid.refreshCells({ coords: [2, 0], cell: { type: 'open' } });

    expect(grid.getCell([2, 0]).type).toBe('open');
    expect(emitted).toBe(true);
    grid.destroy();
  });

  test('skips DOM for cells outside the zoom window', () => {
    const grid = new GameGrid({ matrix: cloneMatrix(), state: { activeCoords: [0, 0] } }, mount);
    grid.setZoom({ minX: 0, minY: 0, maxX: 1, maxY: 1 }, { animate: false });
    const visible = mount.querySelector('[data-gamegrid-coords="1,1"]');

    grid.refreshCells({
      coords: [2, 2],
      cell: { type: 'barrier' },
    });
    grid.refreshCells({
      coords: [1, 1],
      cell: { type: 'barrier', cellAttributes: [['data-zoom-hit', '1']] },
    });

    expect(grid.getCell([2, 2]).type).toBe('barrier');
    expect(grid.refs.cells[2][2].current).toBeNull();
    expect(mount.querySelector('[data-gamegrid-coords="2,2"]')).toBeNull();
    expect(mount.querySelector('[data-gamegrid-coords="1,1"]')).not.toBe(visible);
    expect(
      mount.querySelector('[data-gamegrid-coords="1,1"]')?.getAttribute('data-gamegrid-cell-type'),
    ).toBe('barrier');
    expect(mount.querySelector('[data-gamegrid-coords="1,1"]')?.getAttribute('data-zoom-hit')).toBe(
      '1',
    );
    grid.destroy();
  });

  test('emits CELLS_REFRESHED with an empty list when given no cells', () => {
    const target = new EventTarget();
    const seen: ICellRefresh[][] = [];
    target.addEventListener(gridEventsEnum.CELLS_REFRESHED, (event: Event) => {
      seen.push((event as GameGridDOMEvent).detail.cells as ICellRefresh[]);
    });
    const grid = new GameGrid({ matrix: cloneMatrix(), options: { eventTarget: target } }, mount);

    grid.refreshCells([]);

    expect(seen).toEqual([[]]);
    grid.destroy();
  });
});
