import { classesEnum } from '../enums';
import {
  computeSlideOffset,
  computeSlideTransforms,
  runZoomSlide,
  unionZoomBounds,
} from '../zoom-render';

function mockViewportSize(el: HTMLElement, width: number, height: number): void {
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: width });
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: height });
}

async function flushZoomSlide(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  const viewport = document.querySelector('[data-gamegrid-ref="viewport"]') as HTMLElement | null;
  viewport?.dispatchEvent(
    new TransitionEvent('transitionend', { propertyName: 'transform', bubbles: true }),
  );
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

describe('unionZoomBounds', () => {
  test('merges adjacent horizontal quadrants', () => {
    const sw = { minX: 0, minY: 10, maxX: 9, maxY: 19 };
    const se = { minX: 10, minY: 10, maxX: 19, maxY: 19 };
    expect(unionZoomBounds(sw, se)).toEqual({
      minX: 0,
      minY: 10,
      maxX: 19,
      maxY: 19,
    });
  });

  test('merges adjacent vertical quadrants', () => {
    const ne = { minX: 10, minY: 0, maxX: 19, maxY: 9 };
    const se = { minX: 10, minY: 10, maxX: 19, maxY: 19 };
    expect(unionZoomBounds(ne, se)).toEqual({
      minX: 10,
      minY: 0,
      maxX: 19,
      maxY: 19,
    });
  });
});

describe('computeSlideOffset', () => {
  test('returns pixel delta from bounds shift', () => {
    const from = { minX: 10, minY: 0, maxX: 19, maxY: 9 };
    const to = { minX: 0, minY: 0, maxX: 9, maxY: 9 };
    const viewport = document.createElement('div');
    mockViewportSize(viewport, 200, 100);

    expect(computeSlideOffset(from, to, viewport)).toEqual({ x: 200, y: 0 });
  });
});

describe('computeSlideTransforms', () => {
  test('starts on the from region and ends on the to region horizontally', () => {
    const sw = { minX: 0, minY: 10, maxX: 9, maxY: 19 };
    const se = { minX: 10, minY: 10, maxX: 19, maxY: 19 };
    const union = unionZoomBounds(sw, se);
    const container = document.createElement('div');
    mockViewportSize(container, 300, 300);

    const t = computeSlideTransforms(sw, se, union, container);

    expect(t.startX).toBeCloseTo(0);
    expect(t.endX).toBe(-300);
    expect(t.startY).toBeCloseTo(0);
    expect(t.endY).toBeCloseTo(0);
    expect(t.unionCols).toBe(20);
    expect(t.windowCols).toBe(10);
  });

  test('slides vertically between stacked regions', () => {
    const ne = { minX: 0, minY: 0, maxX: 9, maxY: 9 };
    const se = { minX: 0, minY: 10, maxX: 9, maxY: 19 };
    const union = unionZoomBounds(ne, se);
    const container = document.createElement('div');
    mockViewportSize(container, 200, 400);

    const t = computeSlideTransforms(ne, se, union, container);

    expect(t.startX).toBeCloseTo(0);
    expect(t.endX).toBeCloseTo(0);
    expect(t.startY).toBeCloseTo(0);
    expect(t.endY).toBe(-400);
    expect(t.unionRows).toBe(20);
  });
});

describe('runZoomSlide', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  test('applies transform to the refreshed viewport, not the replaced one', async () => {
    document.body.innerHTML = '<div id="slide-root"></div>';
    const container = document.getElementById('slide-root')!;
    mockViewportSize(container, 300, 300);

    const viewport = document.createElement('div');
    viewport.setAttribute('data-gamegrid-ref', 'viewport');
    mockViewportSize(viewport, 300, 300);
    container.appendChild(viewport);

    const refresh = (): void => {
      container.replaceChildren();
      const next = document.createElement('div');
      next.setAttribute('data-gamegrid-ref', 'viewport');
      mockViewportSize(next, 600, 300);
      container.appendChild(next);
    };

    const from = { minX: 0, minY: 10, maxX: 9, maxY: 19 };
    const to = { minX: 10, minY: 10, maxX: 19, maxY: 19 };

    const slide = runZoomSlide(container, viewport, from, to, 50, refresh);
    const activeViewport = container.querySelector('[data-gamegrid-ref="viewport"]') as HTMLElement;

    expect(activeViewport).not.toBe(viewport);
    expect(activeViewport.style.transform).toBe('translate(0px, 0px)');
    expect(container.classList.contains(classesEnum.GRID_ZOOM_ANIMATING)).toBe(true);
    expect(container.style.width).toBe('300px');

    await flushZoomSlide();
    await slide;

    expect(activeViewport.style.transform).toBe('');
    expect(container.classList.contains(classesEnum.GRID_ZOOM_ANIMATING)).toBe(false);
    expect(container.style.width).toBe('');
  });

  test('calls refresh and resolves immediately when container has zero size', async () => {
    const container = document.createElement('div');
    mockViewportSize(container, 0, 0);
    const viewport = document.createElement('div');
    viewport.setAttribute('data-gamegrid-ref', 'viewport');
    const refresh = vi.fn();

    await runZoomSlide(
      container,
      viewport,
      { minX: 0, minY: 0, maxX: 1, maxY: 1 },
      { minX: 2, minY: 0, maxX: 3, maxY: 1 },
      50,
      refresh,
    );

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  test('cleans up when refresh removes the viewport', async () => {
    document.body.innerHTML = '<div id="slide-root"></div>';
    const container = document.getElementById('slide-root')!;
    mockViewportSize(container, 100, 100);
    const viewport = document.createElement('div');
    viewport.setAttribute('data-gamegrid-ref', 'viewport');
    container.appendChild(viewport);

    await runZoomSlide(
      container,
      viewport,
      { minX: 0, minY: 0, maxX: 1, maxY: 1 },
      { minX: 2, minY: 0, maxX: 3, maxY: 1 },
      50,
      () => container.replaceChildren(),
    );

    expect(container.classList.contains(classesEnum.GRID_ZOOM_ANIMATING)).toBe(false);
    expect(container.style.width).toBe('');
  });

  test('finishes immediately when from and to regions are identical', async () => {
    document.body.innerHTML = '<div id="slide-root"></div>';
    const container = document.getElementById('slide-root')!;
    mockViewportSize(container, 100, 100);
    const viewport = document.createElement('div');
    viewport.setAttribute('data-gamegrid-ref', 'viewport');
    container.appendChild(viewport);
    const bounds = { minX: 0, minY: 0, maxX: 3, maxY: 3 };

    await runZoomSlide(container, viewport, bounds, bounds, 50, () => {});

    expect(container.classList.contains(classesEnum.GRID_ZOOM_ANIMATING)).toBe(false);
  });

  test('falls back to timeout when transitionend targets another property', async () => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="slide-root"></div>';
    const container = document.getElementById('slide-root')!;
    mockViewportSize(container, 100, 100);
    const viewport = document.createElement('div');
    viewport.setAttribute('data-gamegrid-ref', 'viewport');
    container.appendChild(viewport);

    const slide = runZoomSlide(
      container,
      viewport,
      { minX: 0, minY: 0, maxX: 1, maxY: 1 },
      { minX: 2, minY: 0, maxX: 3, maxY: 1 },
      40,
      () => {},
    );

    await vi.runAllTimersAsync();
    const activeViewport = container.querySelector('[data-gamegrid-ref="viewport"]') as HTMLElement;
    activeViewport.dispatchEvent(
      new TransitionEvent('transitionend', { propertyName: 'opacity', bubbles: true }),
    );

    await vi.advanceTimersByTimeAsync(50);
    await slide;

    expect(container.classList.contains(classesEnum.GRID_ZOOM_ANIMATING)).toBe(false);
  });
});
