import type { Coord, Direction } from './types';

// Neighbor order is part of the search result: the first shortest step depends
// on which direction is expanded first. Keep this list stable.
const DIRECTIONS: readonly [Direction, Coord][] = [
  ['up', [0, -1]],
  ['down', [0, 1]],
  ['left', [-1, 0]],
  ['right', [1, 0]],
];

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

function coordKey([x, y]: Coord): string {
  return `${x},${y}`;
}

function chebyshev(a: Coord, b: Coord): number {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
}

function pickRandom<T>(items: readonly T[], rng: () => number = Math.random): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(rng() * items.length)] ?? null;
}

function directionOf(dx: number, dy: number): Direction | null {
  for (const [dir, [ddx, ddy]] of DIRECTIONS) {
    if (ddx === dx && ddy === dy) return dir;
  }
  return null;
}

function deltaOf(dir: Direction): Coord {
  for (const [name, delta] of DIRECTIONS) {
    if (name === dir) return delta;
  }
  return [0, 0];
}

function nearestCoord(from: Coord, coords: readonly Coord[]): Coord | null {
  const first = coords[0];
  if (!first) return null;
  let nearest = first;
  let best = chebyshev(from, nearest);
  for (let i = 1; i < coords.length; i++) {
    const coord = coords[i];
    if (!coord) continue;
    const dist = chebyshev(from, coord);
    if (dist < best) {
      best = dist;
      nearest = coord;
    }
  }
  return nearest;
}

export {
  chebyshev,
  coordKey,
  DIRECTIONS,
  deltaOf,
  directionOf,
  nearestCoord,
  OPPOSITE,
  pickRandom,
};
