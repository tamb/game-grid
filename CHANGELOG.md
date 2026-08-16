# Changelog

All notable changes to `@tamb/gamegrid` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-08-16

### Added

- **`rewind(steps?)` / `rewindTo(index)`**: step back through `state.moves` or jump to a history index (`0` = oldest). Emits `gamegrid:move:rewind` (`detail.steps`, `detail.index`) then `MOVE_LAND`. Optional `callbacks.onRewind`. Not rate-limited by `moveDebounce`.
- **`setCell([x, y], cell)`**: replace one logical matrix cell by reference. Data-only, same contract as `setMatrix` — does not render or refresh the DOM.
- **`refreshCells(cell | cells)`**: write optional cell data and rebuild one or more cell nodes without wiping the grid. Accepts `{ coords, cell? }` or an array of those. Emits `gamegrid:cells:refreshed` with `detail.cells`.
- README / TypeDoc notes for the `setCell` (data) → `refreshCells` (view) flow.
- **`ICell.eventTypes`**: `onEnter` / `onExit` custom event names fire on the grid `eventTarget` when the active cell changes (`detail.coords`, `detail.cell`).

### Fixed

- **`state.moves` overflow dropped the newest coord** (`unshift` + `shift`). History is now oldest-first, capped by `rewindLimit` (oldest dropped first). Blocked attempts are not recorded. `setOptions({ rewindLimit })` trims an over-long trail.
- **`onLand` / `MOVE_LAND` fired when the active cell did not change** (blocked stays, edge bumps, and the initial `render()`). Land now fires only after a real coord change ([#33](https://github.com/tamb/game-grid/pull/33)).
- **`onDettach` / `MOVE_DETTACH` fired whenever the previous cell was collide-type**, including blocked stays and collide → collide. It now means “left a collide cell for a non-collide cell.”
- **`render()` called `setActiveCell`**, which forced `currentDirection` to `DOWN` and emitted collide / dettach / land (and would have fired `eventTypes`) on first paint. Render only highlights the current cell.
- **Cell clicks on the container, a row, or padding threw.** Non-cell targets now no-op.
- **`getActiveCell` / `getPreviousCell` ignored `setCell`** and kept reading the stale `refs.cells` snapshot. They now read matrix data and overlay the mounted node from refs.
- **`destroy()` skipped middleware** by writing `rendered: false` through `updateState`. It now uses `setStateSync`.
- **`setMatrix` on a headless grid left `refs.cells` aliased to the old matrix.**
- **`ICell` had no index signature**, so extra cell fields used by demos/tests (`foo`, `foo2`, …) were untyped.

## [1.1.1] - 2026-08-13

### Changed

- Document that `moveDebounce` can be updated at runtime via `setOptions` without re-rendering the grid (e.g. speed power-ups).

## [1.1.0] - 2026-08-10

### Added

- **`moveDebounce` option**: rate-limit directional moves via `moveUp` / `moveRight` / `moveDown` / `moveLeft`. Pass a number for a shared cooldown in milliseconds, or `[Top, Right, Down, Left]` for per-direction cooldowns. Debounced attempts are ignored silently (no `onMove`, move events, or `setActiveCell`); cell clicks and direct `setActiveCell` calls are unaffected.

## [1.0.0] - 2026-07-29

First stable release.

### Added

- CI workflow running tests, build, and Biome lint on pushes and pull requests to `main`.
- `CHANGELOG.md` and complete `package.json` metadata (`description`, `author`, `keywords`, `repository`, `bugs`).
- UMD bundle entry (`src/umd-entry.ts`) so script-tag consumers get `GameGrid` as the constructor with named exports attached (no `.default` accessor).

### Changed

- Promoted `1.0.0-rc.0` to stable `1.0.0`.

## [1.0.0-rc.0] - 2026-07-25

Release candidate with zoom viewport API, toolchain modernization, and expanded test coverage.

### Added

- **Zoom API**: viewport windows (`setZoom`, `clearZoom`, `zoomQuadrant`, `zoomFraction`, `zoomAround`), region tracking (`regionDivisions`), zoom edge/exit events, and optional CSS slide transitions (`animateZoom`, `slideZoomOnEdge`).
- **Toolchain**: Vitest, Biome, Rolldown (replacing Rollup), TypeDoc docs, and GitHub Pages demo + API reference.
- **State API**: `setStateSync` for shallow state patches with middleware `pre`/`post` hooks.
- **Options**: `eventTarget`, custom CSS class arrays, `moveOnType` allow-list, `constrainToZoom`, `zoomSlideDuration`, `zoomViewportClasses`.
- **Lifecycle**: `destroy()` tears down listeners/DOM and emits `DESTROYED`; `refresh()` rebuilds DOM from the current matrix.
- **Publishing**: `.npmrc.example` for scoped npm publish; `safe.publish` script.
- Demo mobile controls, zoom maze pane, and redesigned GitHub Pages landing page.

### Fixed

- Blocked cells bypassed at zoom edges ([#46](https://github.com/tamb/game-grid/pull/46)).
- Missing `reservedCellAttributes` set lost in zoom merge ([#45](https://github.com/tamb/game-grid/pull/45)).
- Coin maze regenerate listener leak and cell attribute hardening ([#43](https://github.com/tamb/game-grid/pull/43)).
- Container references for headless grids when rendering later ([#39](https://github.com/tamb/game-grid/pull/39)).
- Callback order regression on `getActiveCell` ([#37](https://github.com/tamb/game-grid/pull/37)).
- `onLand` only fires when the active cell actually changes ([#33](https://github.com/tamb/game-grid/pull/33)).

### Changed

- `setActiveCell` is public.
- Build output uses Rolldown (`dist/main.js` ESM + `dist/main.umd.js` UMD).

## [1.0.0-beta.6] - 2024-01-21

Last beta before the zoom and toolchain work above. See git history between `v1.0.0-beta.6` and `v1.0.0-rc.0` for incremental beta releases (beta.7–beta.16 on npm).

[Unreleased]: https://github.com/tamb/game-grid/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/tamb/game-grid/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/tamb/game-grid/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/tamb/game-grid/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/tamb/game-grid/compare/v1.0.0-rc.0...v1.0.0
[1.0.0-rc.0]: https://github.com/tamb/game-grid/compare/v1.0.0-beta.6...v1.0.0-rc.0
[1.0.0-beta.6]: https://github.com/tamb/game-grid/releases/tag/v1.0.0-beta.6
