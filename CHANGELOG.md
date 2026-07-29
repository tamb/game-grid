# Changelog

All notable changes to `@tamb/gamegrid` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.0]: https://github.com/tamb/game-grid/compare/v1.0.0-rc.0...v1.0.0
[1.0.0-rc.0]: https://github.com/tamb/game-grid/compare/v1.0.0-beta.6...v1.0.0-rc.0
[1.0.0-beta.6]: https://github.com/tamb/game-grid/releases/tag/v1.0.0-beta.6
