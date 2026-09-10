import GameGrid, { classesEnum } from '../index';
import {
  countActiveCells,
  makeOpenMatrix,
  makeTypedMatrix,
  mountRoot,
  zigzagMoves,
} from './helpers';

describe('stress / correctness under load', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps a single active cell after 1000 moves on a 50×60 rendered grid', () => {
    const root = mountRoot();
    const grid = new GameGrid(
      {
        matrix: makeOpenMatrix(50, 60),
        state: { activeCoords: [0, 0] },
      },
      root,
    );

    zigzagMoves(grid, 1000);

    expect(grid.getState().activeCoords).toEqual([0, 0]);
    expect(countActiveCells(root)).toBe(1);
    expect(grid.refs.cells[0][0].current?.classList.contains(classesEnum.ACTIVE_CELL)).toBe(true);
    expect(grid.refs.rows.length).toBe(50);
    expect(root.querySelectorAll('[data-gamegrid-ref="cell"]').length).toBe(3000);
    grid.destroy();
  });

  it('survives mixed block / wrap / collide traffic on a large headless grid', () => {
    const matrix = makeTypedMatrix(40, 40, 7);
    const grid = new GameGrid({
      matrix,
      options: {
        infiniteX: true,
        infiniteY: true,
        regionDivisions: 4,
        rewindLimit: 30,
      },
    });

    for (let i = 0; i < 2500; i++) {
      switch (i % 7) {
        case 0:
          grid.moveRight();
          break;
        case 1:
          grid.moveDown();
          break;
        case 2:
          grid.moveLeft();
          break;
        case 3:
          grid.moveUp();
          break;
        case 4:
          grid.rewind();
          break;
        case 5:
          grid.unrewind();
          break;
        default:
          grid.setActiveCell((i * 3) % 40, (i * 5) % 40);
      }
    }

    const [x, y] = grid.getState().activeCoords;
    expect(x).toBeGreaterThanOrEqual(0);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThan(40);
    expect(y).toBeLessThan(40);
    expect(grid.getState().moves.length).toBeGreaterThan(0);
    expect(grid.getState().moves.length).toBeLessThanOrEqual(30);
    grid.destroy();
  });

  it('batch refreshCells then movement still paints exactly one active cell', () => {
    const root = mountRoot();
    const grid = new GameGrid({ matrix: makeOpenMatrix(24, 20) }, root);
    const batch = [];
    for (let y = 0; y < 24; y++) {
      for (let x = 0; x < 20; x++) {
        if ((x + y) % 4 === 0) {
          batch.push({ coords: [x, y] as [number, number], cell: { type: 'open' } });
        }
      }
    }
    grid.refreshCells(batch);
    zigzagMoves(grid, 120);
    expect(countActiveCells(root)).toBe(1);
    grid.destroy();
  });
});
