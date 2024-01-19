import { gridEventsEnum } from './enums';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getKeyByValue(object: any = {}, value: string) {
  return Object.keys(object).find((key) => object[key] === value);
}

export function renderAttributes(el: HTMLElement, tuples: [string, string][]) {
  tuples.forEach((tuple: [string, string]) => {
    if (tuple[0] === 'class') {
      el.classList.add(...tuple[1].split(' '));
    } else {
      el.setAttribute(tuple[0], tuple[1]);
    }
  });
}

export function getCoordsFromElement(el: HTMLElement): number[] | undefined {
  try {
    return el
      ?.getAttribute('data-coords')
      ?.split(',')
      .map((num: string) => parseInt(num));
  } catch (err) {
    throw new Error('Could not get coordinates from element');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fireCustomEvent(eventName: string, data?: any): void {
  window.dispatchEvent(
    new CustomEvent(eventName, {
      detail: {
        ...data,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // @ts-ignore
        gameGridInstance: this,
      },
      bubbles: true,
    }),
  );
}

export function insertStyles(): void {
  const style = document.createElement('style');
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
