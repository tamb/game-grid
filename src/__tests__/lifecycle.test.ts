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
