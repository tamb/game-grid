export function renderDataAttributes(el, tuples) {
  tuples.forEach((tuple) => {
    el.setAttribute(`data-${tuple[0]}`, tuple[1]);
  });
}

export function getCoordsFromElement(el) {
  try {
    return el
      ?.getAttribute("data-coords")
      ?.split(",")
      .map((num) => parseInt(num));
  } catch (err) {
    this.handleError(err);
  }
}

export function fireCustomEvent(el, eventName, data) {
  el.dispatchEvent(
    new CustomEvent(eventName, {
      detail: data,
      bubbles: true,
      passive: true,
    })
  );
}

export function mapRowColIndicesToXY(rI, cI) {
  return [rI, cI].reverse().map((num) => ++num);
}

export function mapXYToRowColIndices(x, y) {
  return [x, y].reverse().map((num) => --num);
}
