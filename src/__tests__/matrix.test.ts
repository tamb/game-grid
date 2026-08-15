import { matrix } from '../__mocks__/matrix';
import GameGrid from '../index';

describe('matrix updates', () => {
  let mount: HTMLDivElement;

  beforeEach(() => {
    mount = document.createElement('div');
    document.body.appendChild(mount);
  });

  afterEach(() => {
    mount.remove();
    document.body.innerHTML = '';
  });

  test('refresh rebuilds DOM after setMatrix changes dimensions', () => {
    const grid = new GameGrid({ matrix }, mount);
    expect(mount.querySelectorAll('[data-gamegrid-ref="cell"]').length).toBe(9);

    grid.setMatrix([[{ type: 'open' }, { type: 'open' }]]);
    grid.refresh();

    expect(mount.querySelectorAll('[data-gamegrid-ref="cell"]').length).toBe(2);
    expect(grid.getMatrix()).toHaveLength(1);
    grid.destroy();
  });

  test('getMatrix returns the matrix reference set by setMatrix', () => {
    const replacement = [[{ type: 'open' }]];
    const grid = new GameGrid({ matrix }, mount);
    grid.setMatrix(replacement);
    expect(grid.getMatrix()).toBe(replacement);
    grid.destroy();
  });

  test('setCell replaces the logical cell at [x, y] without rendering', () => {
    const grid = new GameGrid({ matrix }, mount);
    const next = { type: 'barrier' };
    const beforeType = mount
      .querySelector('[data-gamegrid-coords="1,0"]')
      ?.getAttribute('data-gamegrid-cell-type');

    grid.setCell([1, 0], next);

    expect(grid.getCell([1, 0])).toBe(next);
    expect(grid.getMatrix()[0][1]).toBe(next);
    expect(
      mount.querySelector('[data-gamegrid-coords="1,0"]')?.getAttribute('data-gamegrid-cell-type'),
    ).toBe(beforeType);
    expect(grid.refs.cells[0][1]).not.toBe(next);

    grid.refresh();

    expect(
      mount.querySelector('[data-gamegrid-coords="1,0"]')?.getAttribute('data-gamegrid-cell-type'),
    ).toBe('barrier');
    expect(grid.refs.cells[0][1].type).toBe('barrier');
    grid.destroy();
  });

  test('setCell works headless and is visible to type queries', () => {
    const grid = new GameGrid({ matrix });
    grid.setCell([2, 0], { type: 'interactive' });

    expect(grid.getCell([2, 0]).type).toBe('interactive');
    expect(grid.getAllCellsByType('interactive')).toHaveLength(2);
    grid.destroy();
  });
});
