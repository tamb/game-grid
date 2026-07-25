import { matrix } from '../__mocks__/matrix';
import { keycodeEnum } from '../enums';
import GameGrid from '../index';

describe('keyboard and pointer input', () => {
  let container: HTMLDivElement;
  let grid: GameGrid;

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    container = document.getElementById('root')!;
    grid = new GameGrid(
      {
        matrix,
        state: { activeCoords: [1, 1] },
      },
      container,
    );
  });

  afterEach(() => {
    grid.destroy();
  });

  const keydown = (code: string) => {
    container.dispatchEvent(
      new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true }),
    );
  };

  test('arrow keys move the active cell when arrowControls is enabled', () => {
    keydown(keycodeEnum.ArrowRight);
    expect(grid.getState().activeCoords).toEqual([2, 1]);

    keydown(keycodeEnum.ArrowDown);
    expect(grid.getState().activeCoords).toEqual([2, 2]);

    keydown(keycodeEnum.ArrowLeft);
    expect(grid.getState().activeCoords).toEqual([1, 2]);

    keydown(keycodeEnum.ArrowUp);
    expect(grid.getState().activeCoords).toEqual([1, 1]);
  });

  test('WASD keys move the active cell when wasdControls is enabled', () => {
    grid.setOptions({ wasdControls: true, arrowControls: false });

    keydown(keycodeEnum.KeyRight);
    expect(grid.getState().activeCoords).toEqual([2, 1]);

    keydown(keycodeEnum.KeyDown);
    expect(grid.getState().activeCoords).toEqual([2, 2]);

    keydown(keycodeEnum.KeyLeft);
    expect(grid.getState().activeCoords).toEqual([1, 2]);

    keydown(keycodeEnum.KeyUp);
    expect(grid.getState().activeCoords).toEqual([1, 1]);
  });

  test('arrow keydown calls preventDefault', () => {
    const event = new KeyboardEvent('keydown', {
      code: keycodeEnum.ArrowUp,
      bubbles: true,
      cancelable: true,
    });
    const prevented = !container.dispatchEvent(event);
    expect(prevented).toBe(true);
  });

  test('clicking a cell moves the active cursor to that cell', () => {
    const target = container.querySelector('[data-gamegrid-coords="2,2"]') as HTMLElement;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(grid.getState().activeCoords).toEqual([2, 2]);
  });

  test('clicking is ignored when clickable is false', () => {
    grid.setOptions({ clickable: false });
    const target = container.querySelector('[data-gamegrid-coords="2,2"]') as HTMLElement;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(grid.getState().activeCoords).toEqual([1, 1]);
  });

  test('blur removes custom container classes', () => {
    const styled = new GameGrid(
      {
        matrix,
        options: { containerClasses: ['stage-extra'] },
      },
      document.createElement('div'),
    );
    const styledContainer = styled.refs.container!;
    document.body.appendChild(styledContainer);
    expect(styledContainer.classList.contains('stage-extra')).toBe(true);
    styledContainer.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    expect(styledContainer.classList.contains('stage-extra')).toBe(false);
    styled.destroy();
    styledContainer.remove();
  });
});
