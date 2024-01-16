import GameGrid from '../index';
import { matrix } from '../__mocks__/matrix';

describe('Callbacks', () => {
  let renderedGrid: GameGrid;
  let callbacks = {
    onBlock: jest.fn(),
    onBoundary: jest.fn(),
    onCollide: jest.fn(),
    onDettach: jest.fn(),
    onLand: jest.fn(),
    onMove: jest.fn(),
    onWrap: jest.fn(),
  };

  beforeAll(() => {
    document.body.insertAdjacentHTML('afterbegin', '<div id="root"></div>');
  });

  beforeEach(() => {
    renderedGrid = new GameGrid(
      {
        matrix,
        options: {
          callbacks,
        },
      },
      document.getElementById('root')!,
    );
  });

  afterEach(() => {
    renderedGrid.destroy();
    renderedGrid = null!;
  });

  test('onMove callback is called', () => {
    renderedGrid.moveRight();
    expect(callbacks.onMove).toHaveBeenCalled();
  });

  test('onLand callback is called', () => {
    renderedGrid.moveRight();
    expect(callbacks.onLand).toHaveBeenCalled();
  });

  test('onBlock callback is called', () => {
    renderedGrid.moveRight();
    expect(callbacks.onBlock).toHaveBeenCalled();
  });

  test('onCollide callback is called', () => {
    renderedGrid.moveRight();
    expect(callbacks.onCollide).toHaveBeenCalled();
  });

  test('onDettach callback is called', () => {
    renderedGrid.moveRight();
    expect(callbacks.onDettach).toHaveBeenCalled();
  });

  test('onBoundary callback is called', () => {
    renderedGrid.moveRight();
    expect(callbacks.onBoundary).toHaveBeenCalled();
  });

  test('onWrap callback is called', () => {
    renderedGrid.moveRight();
    expect(callbacks.onWrap).toHaveBeenCalled();
  });
});
