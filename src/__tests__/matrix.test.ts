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
});
