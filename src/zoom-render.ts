import { classesEnum } from './enums';
import type { IZoomBounds } from './interfaces';

export function unionZoomBounds(from: IZoomBounds, to: IZoomBounds): IZoomBounds {
  return {
    minX: Math.min(from.minX, to.minX),
    minY: Math.min(from.minY, to.minY),
    maxX: Math.max(from.maxX, to.maxX),
    maxY: Math.max(from.maxY, to.maxY),
  };
}

export function computeSlideOffset(
  from: IZoomBounds,
  to: IZoomBounds,
  viewportEl: HTMLElement,
): { x: number; y: number } {
  const colsFrom = Math.max(1, from.maxX - from.minX + 1);
  const rowsFrom = Math.max(1, from.maxY - from.minY + 1);
  const cellW = viewportEl.clientWidth / colsFrom;
  const cellH = viewportEl.clientHeight / rowsFrom;
  return {
    x: (from.minX - to.minX) * cellW,
    y: (from.minY - to.minY) * cellH,
  };
}

export function computeSlideTransforms(
  from: IZoomBounds,
  to: IZoomBounds,
  union: IZoomBounds,
  container: HTMLElement,
): {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  windowCols: number;
  windowRows: number;
  unionCols: number;
  unionRows: number;
} {
  const windowCols = Math.max(1, from.maxX - from.minX + 1);
  const windowRows = Math.max(1, from.maxY - from.minY + 1);
  const unionCols = union.maxX - union.minX + 1;
  const unionRows = union.maxY - union.minY + 1;
  const cellW = container.clientWidth / windowCols;
  const cellH = container.clientHeight / windowRows;

  return {
    startX: -(from.minX - union.minX) * cellW,
    startY: -(from.minY - union.minY) * cellH,
    endX: -(to.minX - union.minX) * cellW,
    endY: -(to.minY - union.minY) * cellH,
    windowCols,
    windowRows,
    unionCols,
    unionRows,
  };
}

function getViewport(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-gamegrid-ref="viewport"]') as HTMLElement | null;
}

export function runZoomSlide(
  container: HTMLElement,
  _viewport: HTMLElement,
  from: IZoomBounds,
  to: IZoomBounds,
  duration: number,
  refresh: () => void,
): Promise<void> {
  const lockW = container.clientWidth;
  const lockH = container.clientHeight;
  if (lockW === 0 || lockH === 0) {
    refresh();
    return Promise.resolve();
  }

  const union = unionZoomBounds(from, to);
  const transforms = computeSlideTransforms(from, to, union, container);

  container.classList.add(classesEnum.GRID_ZOOM_ANIMATING);
  container.style.setProperty('--gamegrid-zoom-duration', `${duration}ms`);
  container.style.width = `${lockW}px`;
  container.style.height = `${lockH}px`;

  refresh();

  const slideViewport = getViewport(container);
  if (!slideViewport) {
    container.classList.remove(classesEnum.GRID_ZOOM_ANIMATING);
    container.style.width = '';
    container.style.height = '';
    return Promise.resolve();
  }

  slideViewport.style.width = `${(transforms.unionCols / transforms.windowCols) * 100}%`;
  slideViewport.style.transition = 'none';
  slideViewport.style.transform = `translate(${transforms.startX}px, ${transforms.startY}px)`;

  return new Promise((resolve) => {
    const finish = (): void => {
      container.classList.remove(classesEnum.GRID_ZOOM_ANIMATING);
      container.style.width = '';
      container.style.height = '';
      slideViewport.style.width = '';
      slideViewport.style.transition = '';
      slideViewport.style.transform = '';
      resolve();
    };

    if (transforms.startX === transforms.endX && transforms.startY === transforms.endY) {
      finish();
      return;
    }

    slideViewport.getBoundingClientRect();

    requestAnimationFrame(() => {
      slideViewport.style.transition = `transform ${duration}ms ease-out`;
      slideViewport.style.transform = `translate(${transforms.endX}px, ${transforms.endY}px)`;

      const timeout = setTimeout(finish, duration + 50);
      slideViewport.addEventListener(
        'transitionend',
        (event) => {
          if (event.target !== slideViewport || event.propertyName !== 'transform') {
            return;
          }
          clearTimeout(timeout);
          finish();
        },
        { once: true },
      );
    });
  });
}
