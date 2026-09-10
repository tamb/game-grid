import { performance } from 'node:perf_hooks';
import type GameGrid from '../index';
import type { ICell } from '../interfaces';

/** Median-of-N timing helper for `src/__perf__` regression budgets. */

export function makeOpenMatrix(rows: number, cols: number): ICell[][] {
  const matrix: ICell[][] = new Array(rows);
  for (let y = 0; y < rows; y++) {
    const row: ICell[] = new Array(cols);
    for (let x = 0; x < cols; x++) {
      row[x] = { type: 'open' };
    }
    matrix[y] = row;
  }
  return matrix;
}

export function makeTypedMatrix(rows: number, cols: number, barrierEvery: number): ICell[][] {
  const matrix: ICell[][] = new Array(rows);
  for (let y = 0; y < rows; y++) {
    const row: ICell[] = new Array(cols);
    for (let x = 0; x < cols; x++) {
      const barrier = barrierEvery > 0 && (x + y) % barrierEvery === 0 && !(x === 0 && y === 0);
      row[x] = { type: barrier ? 'barrier' : 'open' };
    }
    matrix[y] = row;
  }
  return matrix;
}

export function zigzagMoves(grid: GameGrid, steps: number): void {
  const dirs = ['moveRight', 'moveDown', 'moveLeft', 'moveUp'] as const;
  for (let i = 0; i < steps; i++) {
    grid[dirs[i % 4]]();
  }
}

export function median(samples: number[]): number {
  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export function measureMedian(fn: () => void, warmup = 1, runs = 5): number {
  for (let i = 0; i < warmup; i++) {
    fn();
  }
  const samples: number[] = [];
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    fn();
    samples.push(performance.now() - t0);
  }
  return median(samples);
}

export function expectWithinBudget(label: string, ms: number, budgetMs: number): void {
  expect(ms, `${label}: ${ms.toFixed(2)}ms (budget ${budgetMs}ms)`).toBeLessThan(budgetMs);
}

export function mountRoot(): HTMLDivElement {
  const existing = document.getElementById('perf-root');
  if (existing) {
    existing.replaceChildren();
    existing.className = '';
    return existing as HTMLDivElement;
  }
  const root = document.createElement('div');
  root.id = 'perf-root';
  document.body.appendChild(root);
  return root;
}

export function countActiveCells(root: HTMLElement): number {
  return root.querySelectorAll('.gamegrid__cell--active').length;
}
