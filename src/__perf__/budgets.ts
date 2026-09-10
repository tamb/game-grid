/** Regression ceilings (ms) for `src/__perf__`. Fail if hot paths exceed these budgets. */

export const PERF_BUDGET_MS = {
  movement: {
    headless80x80x3000: 40,
    headlessRegion80x80x2000: 40,
    rendered30x30x400: 120,
    mountedMoveOnly30x30x400: 40,
    zoomed80x80Window10x10x400: 40,
    moveTo200Steps: 8,
    rewindUnrewind500Cycles: 25,
  },
  render: {
    render40x40: 90,
    refresh40x40: 80,
    refreshCells200On20x20: 20,
    zoomedFirstPaint10x10Of80x80: 20,
  },
  matrix: {
    getAllCellsByType80x80: 5,
    setGetCell8000: 10,
  },
} as const;
