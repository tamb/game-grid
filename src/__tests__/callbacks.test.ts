import GameGrid from '../index';
import { matrix } from '../__mocks__/matrix';

describe('Callbacks', () => {
  let memoryGrid: GameGrid;
  let callbacks = {
    onBlock: jest.fn(),
    onBoundary: jest.fn(),
    onCollide: jest.fn(),
    onDettach: jest.fn(),
    onLand: jest.fn(),
    onMove: jest.fn(),
    onWrap: jest.fn(),
  };

  beforeEach(() => {
    memoryGrid = new GameGrid({
      matrix,
      options: {
        callbacks,
        infiniteX: true,
      },
    });
  });

  afterEach(() => {
    memoryGrid.destroy();
    memoryGrid = null!;
  });

  test('onMove callback is called', () => {
    memoryGrid.moveLeft();
    expect(callbacks.onMove).toHaveBeenCalled();
  });

  test('onLand callback is called', () => {
    memoryGrid.moveRight();
    expect(callbacks.onLand).toHaveBeenCalled();
  });

  test('onBlock callback is called', () => {
    memoryGrid.setStateSync({
      activeCoords: [1, 0],
    });
    memoryGrid.moveRight();

    expect(callbacks.onBlock).toHaveBeenCalled();
  });

  test('onCollide callback is called', () => {
    memoryGrid.moveRight();
    memoryGrid.moveDown();
    expect(callbacks.onCollide).toHaveBeenCalled();
  });

  test('onDettach callback is called', () => {
    memoryGrid.moveRight();
    memoryGrid.moveDown();
    memoryGrid.moveDown();
    expect(callbacks.onDettach).toHaveBeenCalled();
  });

  test('onBoundary callback is called', () => {
    const grid = new GameGrid({
      matrix,
      options: {
        infiniteX: false,
        infiniteY: false,
        callbacks: {
          onBoundary: callbacks.onBoundary,
        },
      },
    });
    grid.moveUp();
    expect(callbacks.onBoundary).toHaveBeenCalled();
  });

  test('onWrap callback is called', () => {
    memoryGrid.moveLeft();
    expect(callbacks.onWrap).toHaveBeenCalled();
  });
});
