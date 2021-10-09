export function renderAttributes(el: HTMLElement, tuples:any) {
  tuples.forEach((tuple: any) => {
    el.setAttribute(tuple[0], tuple[1]);
  });
}

export function getCoordsFromElement(el: HTMLElement): number[] {
  try {
    return el
      ?.getAttribute("data-coords")
      ?.split(",")
      .map((num: string) => parseInt(num));
  } catch (err) {
    this.handleError(err);
  }
}

export function fireCustomEvent(eventName: string, data: any): void {
  window.dispatchEvent(
    new CustomEvent(eventName, {
      detail: {
        ...data,
        game_grid_instance: this,
      },
      bubbles: true,
    })
  );
}

export function mapRowColIndicesToXY(rI: number, cI: number): number[] {
  return [rI, cI].reverse().map((num) => ++num);
}

export function mapXYToRowColIndices(x: number, y: number): number[] {
  return [x, y].reverse().map((num) => --num);
}
