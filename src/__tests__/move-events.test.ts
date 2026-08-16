import { matrix } from '../__mocks__/matrix';
import GameGrid, { gridEventsEnum } from '../index';
import type { GameGridDOMEvent, IMoveEventDetail } from '../interfaces';

function detailOf(event: Event): IMoveEventDetail {
  const detail = (event as GameGridDOMEvent).detail;
  return {
    from: detail.from as number[],
    to: detail.to as number[],
    direction: detail.direction as string | undefined,
    blocked: detail.blocked as boolean,
  };
}

describe('MOVE_* event detail', () => {
  test('directional move events include from, to, direction, and blocked: false', () => {
    const target = new EventTarget();
    let moveDetail: IMoveEventDetail | undefined;
    let landDetail: IMoveEventDetail | undefined;
    target.addEventListener(gridEventsEnum.MOVE_RIGHT, (event: Event) => {
      moveDetail = detailOf(event);
    });
    target.addEventListener(gridEventsEnum.MOVE_LAND, (event: Event) => {
      landDetail = detailOf(event);
    });

    const grid = new GameGrid({
      matrix,
      options: { eventTarget: target },
      state: { activeCoords: [0, 1] },
    });
    grid.moveRight();

    expect(moveDetail).toEqual({
      from: [0, 1],
      to: [1, 1],
      direction: 'RIGHT',
      blocked: false,
    });
    expect(landDetail).toEqual(moveDetail);
    expect(grid.getState().activeCoords).toEqual([1, 1]);
    grid.destroy();
  });

  test('MOVE_BLOCKED includes the rejected cell and blocked: true', () => {
    const target = new EventTarget();
    const details: Record<string, IMoveEventDetail> = {};
    const lands: Event[] = [];
    for (const name of [gridEventsEnum.MOVE_RIGHT, gridEventsEnum.MOVE_BLOCKED]) {
      target.addEventListener(name, (event: Event) => {
        details[name] = detailOf(event);
      });
    }
    target.addEventListener(gridEventsEnum.MOVE_LAND, (event: Event) => lands.push(event));

    const grid = new GameGrid({
      matrix,
      options: { eventTarget: target },
      state: { activeCoords: [1, 0] },
    });
    grid.moveRight();

    const expected = {
      from: [1, 0],
      to: [2, 0],
      direction: 'RIGHT',
      blocked: true,
    };
    expect(details[gridEventsEnum.MOVE_RIGHT]).toEqual(expected);
    expect(details[gridEventsEnum.MOVE_BLOCKED]).toEqual(expected);
    expect(lands).toEqual([]);
    expect(grid.getState().activeCoords).toEqual([1, 0]);
    grid.destroy();
  });

  test('finite-edge bump is not blocked and to equals from', () => {
    const target = new EventTarget();
    let moveDetail: IMoveEventDetail | undefined;
    let boundaryDetail: IMoveEventDetail | undefined;
    target.addEventListener(gridEventsEnum.MOVE_UP, (event: Event) => {
      moveDetail = detailOf(event);
    });
    target.addEventListener(gridEventsEnum.BOUNDARY, (event: Event) => {
      boundaryDetail = detailOf(event);
    });

    const grid = new GameGrid({
      matrix,
      options: { eventTarget: target, infiniteX: false, infiniteY: false },
      state: { activeCoords: [0, 0] },
    });
    grid.moveUp();

    const expected = {
      from: [0, 0],
      to: [0, 0],
      direction: 'UP',
      blocked: false,
    };
    expect(moveDetail).toEqual(expected);
    expect(boundaryDetail).toEqual(expected);
    expect(grid.getState().activeCoords).toEqual([0, 0]);
    grid.destroy();
  });

  test('wrap events include the wrapped destination', () => {
    const target = new EventTarget();
    let wrapDetail: IMoveEventDetail | undefined;
    target.addEventListener(gridEventsEnum.WRAP, (event: Event) => {
      wrapDetail = detailOf(event);
    });

    const grid = new GameGrid({
      matrix,
      options: { eventTarget: target, infiniteX: true },
      state: { activeCoords: [0, 1] },
    });
    grid.moveLeft();

    expect(wrapDetail).toEqual({
      from: [0, 1],
      to: [2, 1],
      direction: 'LEFT',
      blocked: false,
    });
    expect(grid.getState().activeCoords).toEqual([2, 1]);
    grid.destroy();
  });

  test('MOVE_COLLISION and MOVE_DETTACH carry the same attempt detail', () => {
    const target = new EventTarget();
    let collideDetail: IMoveEventDetail | undefined;
    let dettachDetail: IMoveEventDetail | undefined;
    target.addEventListener(gridEventsEnum.MOVE_COLLISION, (event: Event) => {
      collideDetail = detailOf(event);
    });
    target.addEventListener(gridEventsEnum.MOVE_DETTACH, (event: Event) => {
      dettachDetail = detailOf(event);
    });

    const grid = new GameGrid({
      matrix,
      options: { eventTarget: target },
      state: { activeCoords: [0, 1] },
    });
    grid.moveRight();
    expect(collideDetail).toEqual({
      from: [0, 1],
      to: [1, 1],
      direction: 'RIGHT',
      blocked: false,
    });

    grid.moveDown();
    expect(dettachDetail).toEqual({
      from: [1, 1],
      to: [1, 2],
      direction: 'DOWN',
      blocked: false,
    });
    grid.destroy();
  });
});
