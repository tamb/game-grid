# GameGrid v1 roadmap

Follow-up to the post-1.0 audit of `@tamb/gamegrid`. The library stays a **2D matrix + movement-rules** helper (optional DOM). Callbacks and `CustomEvent`s remain the extension point.

Shipped work below landed in **[1.2.0](CHANGELOG.md#120---2026-08-16)** ([#61](https://github.com/tamb/game-grid/pull/61)).

## Unreleased

Movement events, path walking, and a real history API.

- [x] **Richer `MOVE_*` `detail`** — `from`, `to`, `direction`, and whether the attempt blocked. Zoom events already pass `direction` / `zoom` / coords; move events now match.
- [x] **`moveTo(coords)` / step along a path** — walk a list of cells through the existing block / collide / wrap rules. Keep it dumb (no A*).
- [x] **Unrewind / redo** — `state.moves` is a real trail; `state.future` is the forward stack. `unrewind` / `unrewindTo` replay it.

## Done in 1.2.0

Lifecycle contracts, dead APIs, and versioning from the “fix first” list.

- [x] **`ICell.eventTypes` fires** — `onExit` then `onEnter` on `eventTarget` when the active cell changes (`detail.coords`, `detail.cell`). Closes [#17](https://github.com/tamb/game-grid/issues/17).
- [x] **`onLand` / `MOVE_LAND` only on a real coord change** — not on blocked stays, edge bumps, or `render()`. Restores [#33](https://github.com/tamb/game-grid/pull/33).
- [x] **`onDettach` means “left collide for non-collide”** — not on blocked stays or collide → collide. Collide also requires a coord change.
- [x] **`render()` does not call `setActiveCell`** — highlights the current cell; leaves `currentDirection` alone; no collide / dettach / land / `eventTypes` on first paint.
- [x] **Non-cell clicks no-op** — container, row, and padding do not throw. Text-node targets inside a cell still select that cell.
- [x] **`getActiveCell` / `getPreviousCell` follow `setCell`** — matrix data (same source as `getCell`) plus mounted `current` from refs.
- [x] **`destroy()` uses `setStateSync`** — middleware sees `rendered: false`.
- [x] **Headless `setMatrix` re-aliases `refs.cells`** to the new matrix.
- [x] **`ICell` index signature** — extra cell fields (`foo`, `foo2`, …) are typed.
- [x] **Release 1.2.0** — also records already-merged `setCell`, `refreshCells`, `rewind` / `rewindTo`, and the `state.moves` history fix.

## Next

Suggested order. Do not add a second state API or a separate hooks layer.

### Typed extensibility ([#16](https://github.com/tamb/game-grid/issues/16))

`setStateSync` + `StatePatch` already allow extra keys. What is missing is typing and a documented extension story.

- [ ] **`GameGrid<TState extends IState>`** (or `getState(): TState`) so extra fields are not `unknown`.
- [ ] **`protected` hooks** around move / render so subclassing is possible without forking privates.
- [ ] **Short “extend vs compose” note** — extra state via `setStateSync` is enough; subclass only for behavior. Close #16. Do **not** add a second `setState`.

### Input

- [ ] **Touch / swipe** — keyboard + click are built in; the demo invented a d-pad. A small swipe helper or `pointerControls` should respect `moveDebounce`.

### Accessibility

- [ ] **Grid semantics** — container already has `tabindex="0"`. Add `role="grid"`, `aria-selected` (or equivalent) on the active cell, and a live announcement for moves.

### Presentation

- [ ] **Opt-out of injected CSS** — `insertStyles()` always injects a 10px red active ring. `options.injectStyles: false` (or a thinner default) for real games.

### Hardening

- [ ] **Bounds-checked cell access** — `getCell` / `setCell` are documented as unchecked. Add `tryGetCell` and/or `getCellOrThrow` so `matrix[y][x]` does not explode on bad coords.
- [ ] **Finish leftover tests** — `TODO: finish this test` in `src/__tests__/initialization.test.ts`; commented-out cases in `src/__tests__/move.test.ts`.
- [ ] **Tag / publish 1.2.0** — bump is in-tree; `v1.2.0` git tag and npm publish when #61 lands (last published tag is `v1.1.0`).

## Out of scope for v1

Stay a matrix + movement-rules library. The zoom plans already ruled these out:

- A separate hooks layer (callbacks + events are the extension point)
- Pinch / scale zoom (cell-window zoom only)
- Entities, physics, sprites, audio, or built-in A*
- Async / Promise callbacks
