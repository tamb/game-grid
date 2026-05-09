import { matrix } from '../__mocks__/matrix';
import GameGrid from '../index';

describe('Callbacks', () => {
  let memoryGrid: GameGrid;
  const callbacks = {
    onBlock: vi.fn(),
    onBoundary: vi.fn(),
    onCollide: vi.fn(),
    onDettach: vi.fn(),
    onLand: vi.fn(),
    onMove: vi.fn(),
    onWrap: vi.fn(),
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
