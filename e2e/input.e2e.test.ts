import { afterEach, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import GameGrid from '../src/index';
import type { ICell, IOptions } from '../src/interfaces';

function label(text: string): HTMLElement {
  const el = document.createElement('span');
  el.textContent = text;
  return el;
}

function cell(text: string, type: ICell['type']): ICell {
  return { type, render: () => label(text) };
}

let grid: GameGrid;

function mount(options?: Partial<IOptions>): GameGrid {
  document.body.replaceChildren();
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  grid = new GameGrid(
    {
      matrix: [
        [cell('start', 'open'), cell('east', 'open'), cell('wall', 'barrier')],
        [cell('south', 'open'), cell('center', 'open'), cell('coin', 'open')],
      ],
      state: { activeCoords: [0, 0] },
      options,
    },
    root,
  );
  return grid;
}

async function expectActive(coords: string): Promise<void> {
  const [x, y] = coords.split(',').map(Number);
  expect(grid.getState().activeCoords).toEqual([x, y]);
  expect(document.querySelectorAll('.gamegrid__cell--active')).toHaveLength(1);
  const active = document.querySelector('.gamegrid__cell--active');
  await expect
    .element(page.elementLocator(active as HTMLElement))
    .toHaveAttribute('data-gamegrid-coords', coords);
}

afterEach(() => {
  grid?.destroy();
  document.body.replaceChildren();
});

test('the starting cell is highlighted with the bundled inset ring', async () => {
  mount();
  await expectActive('0,0');
  const active = document.querySelector('.gamegrid__cell--active') as HTMLElement;
  expect(getComputedStyle(active).boxShadow).toContain('inset');
});

test('clicking a label inside a cell moves the highlight to that cell', async () => {
  mount();
  await page.getByText('coin').click();
  await expectActive('2,1');
  await page.getByText('south').click();
  await expectActive('0,1');
});

test('arrow keys move the highlight and a barrier blocks the next step', async () => {
  mount();
  await page.getByText('start').click();
  await userEvent.keyboard('{ArrowRight}');
  await expectActive('1,0');
  await userEvent.keyboard('{ArrowRight}');
  await expectActive('1,0');
  await userEvent.keyboard('{ArrowDown}');
  await expectActive('1,1');
});

test('WASD moves when enabled and arrows do not when disabled', async () => {
  mount({ wasdControls: true, arrowControls: false });
  await page.getByText('start').click();
  await userEvent.keyboard('d');
  await expectActive('1,0');
  await userEvent.keyboard('{ArrowDown}');
  await expectActive('1,0');
  await userEvent.keyboard('s');
  await expectActive('1,1');
});

test('clicks do nothing when clickable is false', async () => {
  mount();
  grid.setOptions({ clickable: false });
  await page.getByText('center').click();
  await expectActive('0,0');
});
