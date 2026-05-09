import type { IGameGrid, IGameGridEventDetail } from './interfaces';

/**
 * Apply attribute tuples to an {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement | HTMLElement}.
 *
 * @param el - Dom node being decorated.
 * @param tuples - Pairs `[name,value]` — when `name` is `"class"`, `value` may contain multiple whitespace-delimited tokens.
 *
 * @example Register data attributes alongside classes
 * ```ts
 * renderAttributes(div, [
 *   ["data-gamegrid-coords", `0,0`],
 *   ["class", "tile tile-ground"],
 * ]);
 * ```
 *
 * @category DOM helpers
 */
export function renderAttributes(el: HTMLElement, tuples: [string, string][]): void {
  tuples.forEach((tuple: [string, string]) => {
    if (tuple[0] === 'class') {
      el.classList.add(...tuple[1].split(' '));
    } else {
      el.setAttribute(tuple[0], tuple[1]);
    }
  });
}

/**
 * Parses `data-gamegrid-coords="x,y"` emitted by {@link GameGrid} renders.
 *
 * @param el - Candidate cell {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement | HTMLElement}.
 * @returns `[x,y]` tuple or `undefined` when attribute missing or invalid.
 *
 * @category DOM helpers
 */
export function getCoordsFromElement(el: HTMLElement): [number, number] | undefined {
  const raw = el.getAttribute('data-gamegrid-coords');
  if (raw === null) return undefined;
  const parts = raw.split(',').map((num: string) => Number.parseInt(num, 10));
  if (parts.length !== 2 || parts.some(Number.isNaN)) return undefined;
  return [parts[0], parts[1]];
}

/**
 * Dispatches a bubbling grid `CustomEvent` whose **`detail`** shape matches {@link IGameGridEventDetail}.
 *
 * @param target - Where to dispatch ({@link IOptions.eventTarget} from the emitting grid).
 * @param gameGridInstance - Attached as `detail.gameGridInstance`; becomes the authoritative reference in subscribers.
 * @param eventName - Prefer members of {@link gridEventsEnum}.
 * @param data - Spread before `gameGridInstance` so reserved keys merge predictably (`data` rarely needed for built-ins).
 *
 * @category DOM helpers
 *
 * @example
 * ```ts
 * fireGameGridEvent(window, myGridInstance, gridEventsEnum.CREATED);
 * ```
 */
export function fireGameGridEvent(
  target: EventTarget,
  gameGridInstance: IGameGrid,
  eventName: string,
  data?: Record<string, unknown>,
): void {
  const detail: IGameGridEventDetail = {
    ...(data ?? {}),
    gameGridInstance,
  };
  target.dispatchEvent(
    new CustomEvent(eventName, {
      detail,
      bubbles: true,
    }),
  );
}

const GAMEGRID_STYLE_ATTR = 'data-gamegrid-styles';

/**
 * Injects bundled GameGrid stylesheet into `document.head` once (guarded via `style[data-gamegrid-styles]`).
 *
 * @remarks Safe across multiple grids/instances — subsequent calls bail early.
 *
 * @category DOM helpers
 */
export function insertStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.head.querySelector(`style[${GAMEGRID_STYLE_ATTR}]`)) return;

  const style = document.createElement('style');
  style.setAttribute(GAMEGRID_STYLE_ATTR, '');
  style.setAttribute('data-testid', 'gamegrid-styles');
  style.innerHTML = `
  .gamegrid * {
    box-sizing: border-box;
  }
  .gamegrid__stage {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    box-sizing: border-box;
    border: 1px solid;
  }
  .gamegrid__row {
    display: flex;
    flex-basis: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  .gamegrid__cell {
    flex: 1 0 auto;
    height: auto;
    overflow: hidden;
    box-sizing: border-box;
    border: 1px solid;
  }
  .gamegrid__cell:hover {
    cursor: pointer;
  }
  .gamegrid__cell--active {
    box-shadow:inset 0px 0px 0px 10px #f00;
  }
  .gamegrid__cell::before {
    content: "";
    float: left;
    padding-top: 100%;
  }
  `;
  document.head.appendChild(style);
}
