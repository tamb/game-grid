import type { IGameGrid } from '@tamb/gamegrid';

const wiredRoots = new WeakSet<HTMLElement>();

function resolveRoot(padRoot: string | HTMLElement | null): HTMLElement | null {
  if (padRoot === null) return null;
  if (typeof padRoot === 'string') {
    return document.querySelector(padRoot) as HTMLElement | null;
  }
  return padRoot;
}

/**
 * Delegates clicks on `[data-gamegrid-move]` to {@link IGameGrid} move methods.
 * Safe to call once per pad root; repeated calls for the same element are ignored.
 */
export function wireDirectionPad(
  getGrid: () => IGameGrid | null,
  padRoot: string | HTMLElement | null,
): void {
  const root = resolveRoot(padRoot);
  if (!root || wiredRoots.has(root)) {
    return;
  }
  wiredRoots.add(root);

  root.addEventListener('click', (e: MouseEvent) => {
    const t = (e.target as HTMLElement).closest(
      '[data-gamegrid-move]',
    ) as HTMLElement | null;
    if (!t || !root.contains(t)) {
      return;
    }
    e.preventDefault();
    const dir = t.getAttribute('data-gamegrid-move');
    const grid = getGrid();
    if (!grid) {
      return;
    }
    switch (dir) {
      case 'up':
        grid.moveUp();
        break;
      case 'down':
        grid.moveDown();
        break;
      case 'left':
        grid.moveLeft();
        break;
      case 'right':
        grid.moveRight();
        break;
      default:
        break;
    }
    grid.refs.container?.focus({ preventScroll: true });
  });
}
