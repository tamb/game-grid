import {
  bfsFarthestStep,
  bfsNextStep,
  buildCoveragePath,
  chooseHiderAction,
  chooseSeekerStep,
  createNpcMemory,
  listOpenCells,
  walkableUnlessTypes,
} from '../index';
import type { Cell, Coord, Direction, NpcMemory } from '../types';

function cell(type: string): Cell {
  return { type };
}

function room(size = 9, border = 'barrier', open = 'open'): Cell[][] {
  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) =>
      cell(x === 0 || y === 0 || x === size - 1 || y === size - 1 ? border : open),
    ),
  );
}

function corridor(width: number): Cell[][] {
  const height = 5;
  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) =>
      cell(y === 2 && x > 0 && x < width - 1 ? 'open' : 'barrier'),
    ),
  );
}

const openRoom = room();
const walkOpen = walkableUnlessTypes(['barrier']);

function rolls(...values: number[]): () => number {
  let index = 0;
  return () => values[index++] ?? 0;
}

function seeker(partial: {
  self: Coord;
  matrix?: Cell[][];
  isWalkable?: ReturnType<typeof walkableUnlessTypes>;
  quarry?: { id: string; coord: Coord }[];
  active?: (id: string | null, coord: Coord) => boolean;
  lures?: Coord[];
  memory?: NpcMemory;
  difficulty?: 'dumb' | 'normal' | 'smart';
  legal?: Direction[];
  rng?: () => number;
  pauseOnOverlapMs?: number;
  now?: number;
}) {
  return chooseSeekerStep({
    matrix: partial.matrix ?? openRoom,
    isWalkable: partial.isWalkable ?? walkOpen,
    self: partial.self,
    visibleQuarry: partial.quarry ?? [],
    isQuarryActive: partial.active ?? (() => true),
    lures: partial.lures,
    memory: partial.memory ?? createNpcMemory(),
    difficulty: partial.difficulty ?? 'smart',
    legal: partial.legal,
    rng: partial.rng,
    pauseOnOverlapMs: partial.pauseOnOverlapMs,
    now: partial.now,
  });
}

describe('walkableUnlessTypes', () => {
  it('blocks listed types and cells off the matrix, and leaves other types open', () => {
    const matrix: Cell[][] = [
      [cell('floor'), cell('wall')],
      [cell('water'), cell('barrier')],
    ];
    const isWalkable = walkableUnlessTypes(['wall', 'water']);
    expect(isWalkable(matrix, 0, 0)).toBe(true);
    expect(isWalkable(matrix, 1, 1)).toBe(true);
    expect(isWalkable(matrix, 1, 0)).toBe(false);
    expect(isWalkable(matrix, 0, 1)).toBe(false);
    expect(isWalkable(matrix, 4, 4)).toBe(false);
    expect(isWalkable(matrix, -1, 0)).toBe(false);
  });
});

describe('search helpers', () => {
  it('steps toward a target and refuses a start cell or a walled-off target', () => {
    expect(bfsNextStep(openRoom, walkOpen, [2, 2], [4, 2])).toBe('right');
    expect(bfsNextStep(openRoom, walkOpen, [2, 2], [2, 2])).toBeNull();

    const blocked = walkableUnlessTypes(['wall']);
    const matrix = room(7, 'wall', 'floor');
    for (let y = 0; y < matrix.length; y++) matrix[y][3] = cell('wall');
    expect(bfsNextStep(matrix, blocked, [2, 2], [4, 2])).toBeNull();
    expect(bfsFarthestStep(matrix, blocked, [2, 2], [3, 2])).not.toBe('right');
  });

  it('walks around a wall instead of through it', () => {
    const matrix = room();
    matrix[2][3] = cell('barrier');
    const step = bfsNextStep(matrix, walkOpen, [2, 2], [4, 2]);
    expect(step === 'up' || step === 'down').toBe(true);
  });

  it('returns null when the farthest walk has nowhere to go', () => {
    const matrix = [[cell('floor')]];
    const isWalkable = walkableUnlessTypes(['wall']);
    expect(bfsFarthestStep(matrix, isWalkable, [0, 0], [0, 0])).toBeNull();
    expect(bfsNextStep([], isWalkable, [0, 0], [1, 0])).toBeNull();
  });

  it('lists open cells and skips a missing row', () => {
    const matrix: Cell[][] = [[cell('floor'), cell('wall')]];
    matrix.length = 2;
    const isWalkable = walkableUnlessTypes(['wall']);
    expect(listOpenCells(matrix, isWalkable)).toEqual([[0, 0]]);
  });

  it('snakes interior cells and reverses even rows', () => {
    const matrix = room(5);
    const path = buildCoveragePath(matrix, walkOpen);
    const even = path.filter(([, y]) => y === 2).map(([x]) => x);
    const odd = path.filter(([, y]) => y === 1).map(([x]) => x);
    expect(odd).toEqual([1, 2, 3]);
    expect(even).toEqual([3, 2, 1]);
    expect(buildCoveragePath([], walkOpen)).toEqual([]);
    expect(buildCoveragePath([[cell('open')]], walkOpen)).toEqual([]);
  });

  it('sweeps a jagged row using that row width, not the first row', () => {
    const matrix: Cell[][] = [
      [cell('wall'), cell('wall')],
      [cell('wall'), cell('open'), cell('open'), cell('open'), cell('wall')],
      [cell('wall'), cell('open'), cell('open'), cell('open'), cell('wall')],
      [cell('wall'), cell('wall'), cell('wall'), cell('wall'), cell('wall')],
    ];
    const isWalkable = walkableUnlessTypes(['wall']);
    expect(buildCoveragePath(matrix, isWalkable)).toEqual([
      [1, 1],
      [2, 1],
      [3, 1],
      [3, 2],
      [2, 2],
      [1, 2],
    ]);
  });
});

describe('chooseHiderAction', () => {
  const base = {
    matrix: openRoom,
    isWalkable: walkOpen,
    self: [2, 2] as Coord,
    difficulty: 'smart' as const,
  };

  it('does not taunt unless asked, and a smart hider still flees', () => {
    const omitted = chooseHiderAction({
      ...base,
      threats: [[3, 2]],
      canTauntNow: true,
      rng: rolls(0),
    });
    const explicit = chooseHiderAction({
      ...base,
      threats: [[5, 2]],
      canTauntNow: true,
      taunt: false,
      rng: rolls(0),
    });
    expect(omitted).toBe('down');
    expect(explicit).toBe('down');
  });

  it('taunts on a hit, flees on a smart or normal miss, and waits on a dumb miss', () => {
    expect(
      chooseHiderAction({
        ...base,
        self: [2, 2],
        threats: [[5, 2]],
        difficulty: 'smart',
        canTauntNow: true,
        taunt: true,
        rng: rolls(0),
      }),
    ).toBe('taunt');
    expect(
      chooseHiderAction({
        ...base,
        threats: [[5, 2]],
        difficulty: 'smart',
        canTauntNow: true,
        taunt: true,
        rng: rolls(0.5, 0),
      }),
    ).toBe('down');
    expect(
      chooseHiderAction({
        ...base,
        threats: [[4, 2]],
        difficulty: 'normal',
        canTauntNow: true,
        taunt: true,
        rng: rolls(0),
      }),
    ).toBe('taunt');
    expect(
      chooseHiderAction({
        ...base,
        threats: [[4, 2]],
        difficulty: 'normal',
        canTauntNow: true,
        taunt: true,
        rng: rolls(0.5, 0),
      }),
    ).toBe('left');
    expect(
      chooseHiderAction({
        ...base,
        threats: [[4, 2]],
        difficulty: 'dumb',
        canTauntNow: true,
        taunt: true,
        rng: rolls(0, 0.9),
      }),
    ).toBe('taunt');
    expect(
      chooseHiderAction({
        ...base,
        threats: [[4, 2]],
        difficulty: 'dumb',
        canTauntNow: true,
        taunt: true,
        rng: rolls(0.5, 0.9),
      }),
    ).toBeNull();
  });

  it('skips the taunt roll when cooldown, distance, or threats say no', () => {
    expect(
      chooseHiderAction({
        ...base,
        threats: [[5, 2]],
        canTauntNow: false,
        taunt: true,
        rng: rolls(0),
      }),
    ).toBe('down');
    expect(
      chooseHiderAction({
        ...base,
        threats: [],
        canTauntNow: true,
        taunt: true,
        rng: rolls(0),
      }),
    ).toBeNull();
    expect(
      chooseHiderAction({
        ...base,
        self: [2, 2],
        threats: [[3, 2]],
        canTauntNow: true,
        taunt: true,
        rng: rolls(0),
      }),
    ).toBe('down');
    expect(
      chooseHiderAction({
        ...base,
        self: [2, 2],
        threats: [[9, 2]],
        difficulty: 'smart',
        canTauntNow: true,
        taunt: true,
        legal: ['left'],
        rng: rolls(0),
      }),
    ).toBeNull();
    expect(
      chooseHiderAction({
        ...base,
        threats: [[8, 2]],
        difficulty: 'normal',
        canTauntNow: true,
        taunt: true,
        legal: ['left'],
        rng: rolls(0),
      }),
    ).toBeNull();
    expect(
      chooseHiderAction({
        ...base,
        threats: [[8, 2]],
        difficulty: 'dumb',
        canTauntNow: true,
        taunt: true,
        legal: ['left'],
        rng: rolls(0.9),
      }),
    ).toBeNull();
  });

  it('flees, waits, or steps away, and honors an empty legal list', () => {
    expect(
      chooseHiderAction({
        ...base,
        difficulty: 'dumb',
        threats: [],
        legal: ['left', 'right'],
        rng: rolls(0, 0),
      }),
    ).toBe('left');
    expect(
      chooseHiderAction({
        ...base,
        difficulty: 'dumb',
        threats: [[3, 2]],
        rng: rolls(0.9),
      }),
    ).toBeNull();
    expect(
      chooseHiderAction({
        ...base,
        difficulty: 'normal',
        self: [4, 2],
        threats: [[2, 2]],
        rng: rolls(0),
      }),
    ).toBe('right');
    expect(
      chooseHiderAction({
        ...base,
        difficulty: 'normal',
        self: [2, 4],
        threats: [[2, 2]],
        rng: rolls(0),
      }),
    ).toBe('down');
    expect(
      chooseHiderAction({
        ...base,
        difficulty: 'normal',
        threats: [],
      }),
    ).toBeNull();
    expect(
      chooseHiderAction({
        ...base,
        difficulty: 'normal',
        self: [2, 2],
        threats: [[7, 2]],
      }),
    ).toBeNull();
    expect(
      chooseHiderAction({
        ...base,
        difficulty: 'smart',
        self: [2, 2],
        threats: [[9, 2]],
        legal: ['left'],
      }),
    ).toBeNull();

    const onlyOntoThreat = chooseHiderAction({
      ...base,
      difficulty: 'normal',
      self: [2, 2],
      threats: [[3, 2]],
      legal: ['right'],
    });
    expect(onlyOntoThreat).toBeNull();

    const randomSafe = chooseHiderAction({
      ...base,
      difficulty: 'normal',
      self: [2, 2],
      threats: [[4, 2]],
      legal: ['up', 'down'],
      rng: rolls(0),
    });
    expect(randomSafe).toBe('up');

    const smartFallback = chooseHiderAction({
      ...base,
      difficulty: 'smart',
      self: [2, 2],
      threats: [[3, 2]],
      legal: ['up'],
      rng: rolls(0),
    });
    expect(smartFallback).toBe('up');

    expect(
      chooseHiderAction({
        ...base,
        threats: [[5, 2]],
        legal: [],
      }),
    ).toBeNull();

    const walled = [[cell('wall')]];
    expect(
      chooseHiderAction({
        matrix: walled,
        isWalkable: walkableUnlessTypes(['wall']),
        self: [0, 0],
        threats: [[1, 0]],
        difficulty: 'normal',
      }),
    ).toBeNull();
  });

  it('uses the nearest threat and skips holes in the threat list', () => {
    const threats: Coord[] = [[8, 2]];
    threats.length = 3;
    threats[2] = [4, 2];
    expect(
      chooseHiderAction({
        ...base,
        difficulty: 'normal',
        self: [2, 2],
        threats,
        rng: rolls(0),
      }),
    ).toBe('left');
  });

  it('steps the other axis when the direct step is blocked', () => {
    const matrix = room();
    matrix[2][3] = cell('barrier');
    expect(
      chooseHiderAction({
        matrix,
        isWalkable: walkOpen,
        self: [2, 2],
        threats: [[4, 3]],
        difficulty: 'normal',
        legal: ['down', 'up', 'left'],
        rng: rolls(0),
      }),
    ).toBe('up');
  });

  it('paths toward the farther room when that is not directly away', () => {
    const matrix = ['#######', '#.....#', '#.#####', '#.#####', '#######'].map((row) =>
      [...row].map((symbol) => cell(symbol === '#' ? 'barrier' : 'open')),
    );
    const isWalkable = walkableUnlessTypes(['barrier']);
    const shared = {
      matrix,
      isWalkable,
      self: [1, 2] as Coord,
      threats: [[2, 1]] as Coord[],
    };

    expect(chooseHiderAction({ ...shared, difficulty: 'normal', rng: rolls(0.9) })).toBe('down');
    expect(chooseHiderAction({ ...shared, difficulty: 'smart', rng: rolls(0.9) })).toBe('up');
  });

  it('takes the remaining safe step when both direct axes are blocked', () => {
    const matrix = room();
    matrix[2][3] = cell('barrier');
    matrix[3][2] = cell('barrier');
    const step = chooseHiderAction({
      matrix,
      isWalkable: walkOpen,
      self: [2, 2],
      threats: [[4, 4]],
      difficulty: 'normal',
      legal: ['left'],
      rng: rolls(0),
    });
    expect(step).toBe('left');
  });

  it('can roll without an injected rng', () => {
    const step = chooseHiderAction({
      ...base,
      difficulty: 'dumb',
      threats: [],
      legal: ['left'],
    });
    expect(step === 'left' || step === null).toBe(true);
  });
});

describe('chooseSeekerStep', () => {
  it('chases the closer quarry and keeps the earlier one on a tie', () => {
    const board = corridor(12);
    const memory = createNpcMemory();
    expect(
      seeker({
        matrix: board,
        self: [5, 2],
        quarry: [
          { id: 'far', coord: [9, 2] },
          { id: 'near', coord: [6, 2] },
        ],
        memory,
      }),
    ).toBe('right');
    expect(memory.lastSeenId).toBe('near');
    expect(memory.ttl).toBe(12);
    expect(memory.visited.has('5,2')).toBe(true);

    const tie = createNpcMemory();
    expect(
      seeker({
        matrix: board,
        self: [5, 2],
        quarry: [
          { id: 'east', coord: [6, 2] },
          { id: 'west', coord: [4, 2] },
        ],
        memory: tie,
      }),
    ).toBe('right');
    expect(tie.lastSeenId).toBe('east');
  });

  it('records a heading for the same quarry and clears it for a different one', () => {
    const board = corridor(12);
    const same = createNpcMemory();
    same.lastSeen = [4, 2];
    same.lastSeenId = 'hider';
    seeker({
      matrix: board,
      self: [5, 2],
      quarry: [{ id: 'hider', coord: [6, 2] }],
      memory: same,
    });
    expect(same.heading).toBe('right');

    const other = createNpcMemory();
    other.lastSeen = [4, 2];
    other.lastSeenId = 'old';
    other.heading = 'up';
    seeker({
      matrix: board,
      self: [5, 2],
      quarry: [{ id: 'hider', coord: [6, 2] }],
      memory: other,
    });
    expect(other.heading).toBeNull();

    const still = createNpcMemory();
    still.lastSeen = [5, 2];
    still.lastSeenId = 'hider';
    still.heading = 'up';
    still.lure = [6, 2];
    seeker({
      matrix: board,
      self: [5, 2],
      quarry: [{ id: 'hider', coord: [5, 2] }],
      lures: [[6, 2]],
      memory: still,
      legal: ['left', 'right'],
    });
    expect(still.heading).toBe('up');
  });

  it('heads vertically when the quarry moves more in that axis', () => {
    const memory = createNpcMemory();
    memory.lastSeen = [5, 2];
    memory.lastSeenId = 'hider';
    seeker({
      self: [5, 4],
      quarry: [{ id: 'hider', coord: [5, 6] }],
      memory,
      legal: ['down'],
    });
    expect(memory.heading).toBe('down');

    const left = createNpcMemory();
    left.lastSeen = [6, 2];
    left.lastSeenId = 'hider';
    seeker({
      matrix: corridor(12),
      self: [4, 2],
      quarry: [{ id: 'hider', coord: [3, 2] }],
      memory: left,
    });
    expect(left.heading).toBe('left');
  });

  it('follows a lure before last-seen, and keeps the earlier lure on a tie', () => {
    const board = corridor(12);
    const memory = createNpcMemory();
    memory.lastSeen = [2, 2];
    memory.lastSeenId = 'hider';
    memory.ttl = 8;
    expect(
      seeker({
        matrix: board,
        self: [5, 2],
        lures: [
          [4, 2],
          [8, 2],
        ],
        memory,
        active: () => true,
      }),
    ).toBe('left');
    expect(memory.lure).toEqual([4, 2]);
    expect(memory.lastSeen).toEqual([2, 2]);
  });

  it('clears a lure the seeker is standing on and ignores a missing lure list', () => {
    const memory = createNpcMemory();
    memory.lure = [5, 2];
    seeker({
      matrix: corridor(12),
      self: [5, 2],
      lures: [],
      memory,
      legal: ['right'],
    });
    expect(memory.lure).toBeNull();

    const fresh = createNpcMemory();
    seeker({
      matrix: corridor(12),
      self: [5, 2],
      memory: fresh,
      legal: ['right'],
    });
    expect(fresh.lure).toBeNull();
  });

  it('forgets a sighting that is inactive or out of time, otherwise resumes it', () => {
    const board = corridor(12);
    const gone = createNpcMemory();
    gone.lastSeen = [8, 2];
    gone.lastSeenId = 'hider';
    gone.ttl = 4;
    seeker({
      matrix: board,
      self: [5, 2],
      memory: gone,
      active: () => false,
      legal: ['right'],
    });
    expect(gone.lastSeen).toBeNull();

    const expired = createNpcMemory();
    expired.lastSeen = [8, 2];
    expired.lastSeenId = 'hider';
    expired.ttl = 0;
    seeker({
      matrix: board,
      self: [5, 2],
      memory: expired,
      legal: ['left'],
    });
    expect(expired.lastSeen).toBeNull();

    const live = createNpcMemory();
    live.lastSeen = [8, 2];
    live.lastSeenId = 'hider';
    live.ttl = 3;
    expect(
      seeker({
        matrix: board,
        self: [5, 2],
        memory: live,
        difficulty: 'normal',
      }),
    ).toBe('right');
    expect(live.ttl).toBe(2);
  });

  it('investigates after arrival, including a heading, a ring, and a dead end', () => {
    const board = corridor(12);
    const heading = createNpcMemory();
    heading.lastSeen = [5, 2];
    heading.lastSeenId = 'hider';
    heading.ttl = 4;
    heading.heading = 'right';
    expect(
      seeker({
        matrix: board,
        self: [5, 2],
        memory: heading,
        legal: ['right', 'left'],
      }),
    ).toBe('right');
    expect(heading.heading).toBeNull();
    expect(heading.investigating).toBe(true);

    const blockedHeading = createNpcMemory();
    blockedHeading.lastSeen = [5, 2];
    blockedHeading.lastSeenId = 'hider';
    blockedHeading.ttl = 4;
    blockedHeading.heading = 'right';
    blockedHeading.investigating = true;
    const around = seeker({
      matrix: board,
      self: [5, 2],
      memory: blockedHeading,
      legal: ['left'],
    });
    expect(around).toBe('left');

    const dumb = createNpcMemory();
    dumb.lastSeen = [5, 2];
    dumb.lastSeenId = 'hider';
    dumb.ttl = 2;
    dumb.investigating = true;
    seeker({
      matrix: board,
      self: [5, 2],
      memory: dumb,
      difficulty: 'dumb',
      legal: ['left', 'right'],
    });
    expect(dumb.lastSeen).toBeNull();

    const exhausted = createNpcMemory();
    exhausted.lastSeen = [5, 2];
    exhausted.lastSeenId = 'hider';
    exhausted.ttl = 4;
    exhausted.investigating = true;
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[0].length; x++) {
        exhausted.visited.add(`${x},${y}`);
      }
    }
    seeker({
      matrix: board,
      self: [5, 2],
      memory: exhausted,
      difficulty: 'normal',
      legal: ['left', 'right'],
    });
    expect(exhausted.lastSeen).toBeNull();
  });

  it('keeps the coverage sweep on the same memory and uses a coarser path for normal', () => {
    const board = room(7);
    const memory = createNpcMemory();
    const first = seeker({
      matrix: board,
      self: [1, 1],
      memory,
      difficulty: 'normal',
    });
    expect(first).not.toBeNull();
    expect(memory.coverageCells.length).toBeGreaterThan(0);
    expect(memory.coverageCells.every(([, y]) => y % 2 === 0)).toBe(true);
    const remembered = memory.coverageCells.length;
    seeker({
      matrix: board,
      self: [1, 2],
      memory,
      difficulty: 'normal',
    });
    expect(memory.coverageCells.length).toBe(remembered);
    expect(memory.visited.has('1,1')).toBe(true);
    expect(memory.visited.has('1,2')).toBe(true);

    const smart = createNpcMemory();
    seeker({
      matrix: board,
      self: [1, 1],
      memory: smart,
      difficulty: 'smart',
    });
    expect(smart.coverageCells.some(([, y]) => y % 2 === 1)).toBe(true);
  });

  it('still moves after the sweep is exhausted and when coverage cannot be followed', () => {
    const board = room(5);
    const memory = createNpcMemory();
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[0].length; x++) {
        if (board[y][x].type === 'open') memory.visited.add(`${x},${y}`);
      }
    }
    expect(
      seeker({
        matrix: board,
        self: [2, 2],
        memory,
        difficulty: 'dumb',
        legal: ['left'],
      }),
    ).toBe('left');

    const tiny = createNpcMemory();
    expect(
      seeker({
        matrix: [[cell('open'), cell('open')]],
        isWalkable: walkableUnlessTypes(['wall']),
        self: [0, 0],
        memory: tiny,
        difficulty: 'normal',
        legal: ['right'],
      }),
    ).toBe('right');
    expect(tiny.coverageCells).toEqual([]);
  });

  it('returns null when the caller allows no step and does not mark the cell visited', () => {
    const memory = createNpcMemory();
    expect(
      seeker({
        self: [2, 2],
        memory,
        legal: [],
      }),
    ).toBeNull();
    expect(memory.visited.size).toBe(0);
  });

  it('falls through a chase the caller will not accept', () => {
    const board = corridor(12);
    const memory = createNpcMemory();
    expect(
      seeker({
        matrix: board,
        self: [5, 2],
        quarry: [{ id: 'hider', coord: [8, 2] }],
        memory,
        legal: ['left'],
      }),
    ).toBe('left');
    expect(memory.lastSeenId).toBe('hider');
  });

  it('uses open neighbors when legal steps are omitted', () => {
    const step = seeker({
      matrix: corridor(12),
      self: [5, 2],
      difficulty: 'dumb',
    });
    expect(step === 'left' || step === 'right').toBe(true);
  });

  it('prefers an unvisited neighbor', () => {
    const memory = createNpcMemory();
    memory.visited.add('6,2');
    const board = corridor(12);
    const step = seeker({
      matrix: board,
      self: [5, 2],
      memory,
      difficulty: 'dumb',
      legal: ['left', 'right'],
    });
    expect(step).toBe('left');
  });

  it('moves on immediately when already standing on a visible quarry', () => {
    const board = corridor(12);
    const memory = createNpcMemory();
    expect(
      seeker({
        matrix: board,
        self: [5, 2],
        quarry: [{ id: 'hider', coord: [5, 2] }],
        lures: [[8, 2]],
        memory,
        legal: ['left', 'right'],
        pauseOnOverlapMs: 0,
      }),
    ).toBe('right');
    expect(memory.lastSeen).toEqual([5, 2]);
    expect(memory.lastSeenId).toBe('hider');
    expect(memory.ttl).toBe(12);
    expect(memory.investigating).toBe(false);
    expect(memory.lure).toEqual([8, 2]);
    expect(memory.overlapSince).toBeNull();
  });

  it('waits pauseOnOverlapMs before the next move, then allows it', () => {
    const board = corridor(12);
    const memory = createNpcMemory();
    const overlapping = {
      matrix: board,
      self: [5, 2] as Coord,
      quarry: [{ id: 'hider', coord: [5, 2] as Coord }],
      lures: [[8, 2] as Coord],
      memory,
      legal: ['left', 'right'] as Direction[],
      pauseOnOverlapMs: 500,
    };

    expect(seeker({ ...overlapping, now: 1_000 })).toBeNull();
    expect(memory.overlapSince).toBe(1_000);
    expect(memory.lastSeen).toEqual([5, 2]);

    expect(seeker({ ...overlapping, now: 1_499 })).toBeNull();
    expect(memory.overlapSince).toBe(1_000);

    expect(seeker({ ...overlapping, now: 1_500 })).toBe('right');
    expect(memory.overlapSince).toBe(1_000);

    expect(
      seeker({
        ...overlapping,
        quarry: [{ id: 'hider', coord: [7, 2] }],
        now: 1_600,
      }),
    ).toBe('right');
    expect(memory.overlapSince).toBeNull();

    expect(seeker({ ...overlapping, now: 1_700 })).toBeNull();
    expect(memory.overlapSince).toBe(1_700);
    expect(seeker({ ...overlapping, now: 2_199 })).toBeNull();
    expect(seeker({ ...overlapping, now: 2_200 })).toBe('right');
  });

  it('uses Date.now when pauseOnOverlapMs is set and now is omitted', () => {
    const memory = createNpcMemory();
    const before = Date.now();
    expect(
      seeker({
        matrix: corridor(12),
        self: [5, 2],
        quarry: [{ id: 'hider', coord: [5, 2] }],
        lures: [[8, 2]],
        memory,
        legal: ['right'],
        pauseOnOverlapMs: 5_000,
      }),
    ).toBeNull();
    const after = Date.now();
    expect(memory.overlapSince).toBeGreaterThanOrEqual(before);
    expect(memory.overlapSince).toBeLessThanOrEqual(after);
  });

  it('copies a lure so a reused coordinate tuple cannot retarget the seeker', () => {
    const slot: Coord = [8, 2];
    const memory = createNpcMemory();
    seeker({
      matrix: corridor(12),
      self: [5, 2],
      lures: [slot],
      memory,
      legal: ['right'],
    });
    expect(memory.lure).toEqual([8, 2]);
    expect(memory.lure).not.toBe(slot);
    slot[0] = 1;
    expect(memory.lure).toEqual([8, 2]);
  });

  it('skips an unreachable coverage cell and retries a step the caller rejected', () => {
    const board = room(7);
    for (let y = 0; y < board.length; y++) board[y][2] = cell('barrier');
    const memory = createNpcMemory();
    seeker({
      matrix: board,
      self: [4, 1],
      memory,
      difficulty: 'smart',
      legal: ['left', 'right'],
    });
    expect(memory.coverageCells[0]).toEqual([1, 1]);
    expect(memory.coverageIndex).toBe(1);

    expect(
      seeker({
        matrix: board,
        self: [4, 1],
        memory,
        difficulty: 'smart',
        legal: ['left', 'right'],
      }),
    ).toBe('left');
    expect(memory.coverageIndex).toBe(1);

    const open = room(5);
    const blocked = createNpcMemory();
    const toward = bfsNextStep(open, walkOpen, [2, 2], [1, 1]);
    expect(toward).not.toBeNull();
    seeker({
      matrix: open,
      self: [2, 2],
      memory: blocked,
      difficulty: 'smart',
      legal: [toward === 'left' ? 'right' : 'left'],
    });
    expect(blocked.coverageIndex).toBe(0);
    expect(blocked.coverageCells[0]).toEqual([1, 1]);
  });

  it('does not skip the patrol cell the seeker is already standing on', () => {
    const board = room(5);
    const memory = createNpcMemory();
    seeker({
      matrix: board,
      self: [2, 1],
      memory,
      difficulty: 'smart',
      legal: ['left'],
    });
    for (const [x, y] of memory.coverageCells) memory.visited.add(`${x},${y}`);
    memory.coverageIndex = 0;
    seeker({
      matrix: board,
      self: [2, 1],
      memory,
      difficulty: 'smart',
      legal: ['left'],
    });
    expect(memory.coverageCells[1]).toEqual([2, 1]);
    expect(memory.coverageIndex).toBe(1);
  });
});
