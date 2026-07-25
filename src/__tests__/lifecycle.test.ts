import { matrix } from '../__mocks__/matrix';
import GameGrid, { gridEventsEnum } from '../index';

describe('lifecycle', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  test('destroy empties DOM, clears grid class, and emits DESTROYED', () => {
    const el = document.getElementById('root')!;
    const dispatched: string[] = [];
    window.addEventListener(gridEventsEnum.DESTROYED, () =>
      dispatched.push(gridEventsEnum.DESTROYED),
    );
    const g = new GameGrid({ matrix }, el);
    expect(el.querySelector('[data-gamegrid-ref="cell"]')).toBeTruthy();
    expect(el.classList.contains('gamegrid')).toBe(true);
    g.destroy();
    expect(el.classList.contains('gamegrid')).toBe(false);
    expect(el.childElementCount).toBe(0);
    expect(dispatched).toContain(gridEventsEnum.DESTROYED);
  });

  test('refresh rebuilds DOM and restores active highlighting', () => {
    const el = document.getElementById('root')!;
    const g = new GameGrid({ matrix }, el);
    g.setStateSync({ activeCoords: [2, 1] });
    g.refresh();
    const active = el.querySelector('.gamegrid__cell--active');
    expect(active?.getAttribute('data-gamegrid-coords')).toBe('2,1');
  });

  test('refresh throws when render has not been called', () => {
    const grid = new GameGrid({ matrix });
    expect(() => grid.refresh()).toThrow(/requires render/);
    grid.destroy();
  });

  test('destroy removes custom container classes from the DOM', () => {
    const el = document.getElementById('root')!;
    const g = new GameGrid(
      {
        matrix,
        options: { containerClasses: ['stage-extra'] },
      },
      el,
    );
    expect(el.classList.contains('stage-extra')).toBe(true);
    g.destroy();
    expect(el.classList.contains('stage-extra')).toBe(false);
  });

  test('respects options.eventTarget for events', () => {
    const target = new EventTarget();
    let seen = false;
    target.addEventListener(gridEventsEnum.CREATED, () => {
      seen = true;
    });
    const g = new GameGrid(
      {
        matrix,
        options: { eventTarget: target },
      },
      undefined,
    );
    expect(seen).toBe(true);
    g.destroy();
  });
});
