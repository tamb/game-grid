import { afterEach, expect, test } from 'vitest';
import GameGrid from '../src/index';
import type { ICell } from '../src/interfaces';

function openCell(): ICell {
  return { type: 'open' };
}

function matrix(size: number): ICell[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, openCell));
}

let grid: GameGrid | undefined;

function mount(): HTMLElement {
  document.body.replaceChildren();
  const frame = document.createElement('div');
  frame.style.width = '200px';
  frame.style.height = '200px';
  const root = document.createElement('div');
  root.style.width = '100%';
  root.style.height = '100%';
  frame.appendChild(root);
  document.body.appendChild(frame);
  return root;
}

function visibleCoords(root: HTMLElement): string[] {
  const container = root.getBoundingClientRect();
  return [...root.querySelectorAll('[data-gamegrid-ref="cell"]')]
    .filter((el) => {
      const rect = el.getBoundingClientRect();
      const widthInside =
        Math.min(rect.right, container.right) - Math.max(rect.left, container.left);
      const heightInside =
        Math.min(rect.bottom, container.bottom) - Math.max(rect.top, container.top);
      return widthInside > rect.width * 0.5 && heightInside > rect.height * 0.5;
    })
    .map((el) => el.getAttribute('data-gamegrid-coords') ?? '');
}

afterEach(() => {
  grid?.destroy();
  document.body.replaceChildren();
});

test('animated clearZoom starts on the window the player was viewing', () => {
  const root = mount();
  grid = new GameGrid(
    {
      matrix: matrix(4),
      options: { animateZoom: true, zoomSlideDuration: 5000 },
      state: { activeCoords: [3, 3] },
    },
    root,
  );

  grid.setZoom({ minX: 2, minY: 2, maxX: 3, maxY: 3 }, { animate: false });
  expect(visibleCoords(root).sort()).toEqual(['2,2', '2,3', '3,2', '3,3']);

  grid.clearZoom({ animate: true });

  const viewport = root.querySelector('[data-gamegrid-ref="viewport"]') as HTMLElement;
  expect(viewport.getBoundingClientRect().width).toBeCloseTo(400, 0);
  expect(visibleCoords(root).sort()).toEqual(['2,2', '2,3', '3,2', '3,3']);
  const cell = root.querySelector('[data-gamegrid-coords="2,2"]') as HTMLElement;
  expect(cell.getBoundingClientRect().width).toBeCloseTo(100, 0);
});

test('animated zoom into a smaller window starts with the current cells still visible', () => {
  const root = mount();
  grid = new GameGrid(
    {
      matrix: matrix(4),
      options: { animateZoom: true, zoomSlideDuration: 5000 },
      state: { activeCoords: [0, 0] },
    },
    root,
  );

  grid.setZoom({ minX: 0, minY: 0, maxX: 3, maxY: 3 }, { animate: false });
  expect(visibleCoords(root)).toHaveLength(16);

  grid.setZoom({ minX: 2, minY: 2, maxX: 3, maxY: 3 }, { animate: true });

  expect(visibleCoords(root)).toHaveLength(16);
  const cell = root.querySelector('[data-gamegrid-coords="0,0"]') as HTMLElement;
  expect(cell.getBoundingClientRect().width).toBeCloseTo(50, 0);
});

test('same-size quadrant slide starts on the source quadrant at the same cell size', () => {
  const root = mount();
  grid = new GameGrid(
    {
      matrix: matrix(4),
      options: { animateZoom: true, zoomSlideDuration: 5000, regionDivisions: 2 },
      state: { activeCoords: [0, 0] },
    },
    root,
  );

  grid.zoomQuadrant('nw', { animate: false });
  const before = (
    root.querySelector('[data-gamegrid-coords="0,0"]') as HTMLElement
  ).getBoundingClientRect().width;

  grid.zoomQuadrant('ne', { animate: true });

  expect(visibleCoords(root).sort()).toEqual(['0,0', '0,1', '1,0', '1,1']);
  const cell = root.querySelector('[data-gamegrid-coords="0,0"]') as HTMLElement;
  expect(cell.getBoundingClientRect().width).toBeCloseTo(before, 0);
  expect(cell.getBoundingClientRect().width).toBeCloseTo(100, 0);
});
