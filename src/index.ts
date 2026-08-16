/**
 * Barrel entry documenting the **`@tamb/gamegrid`** public API.
 *
 * @packageDocumentation
 * @remarks The {@link GameGrid} class is the default export. Custom grid events use {@link IGameGridEventDetail} / {@link GameGridDOMEvent} with string names from {@link gridEventsEnum}.
 */

import {
  cellTypeEnum,
  classesEnum,
  directionClassEnum,
  directionEnum,
  gridEventsEnum,
  INITIAL_STATE,
  keycodeEnum,
} from './enums';
import type {
  ICell,
  ICellRefresh,
  IConfig,
  IGameGrid,
  IOptions,
  IRefsObject,
  IRegionTile,
  IState,
  IZoomBounds,
  IZoomOptions,
  StatePatch,
  ZoomQuadrant,
} from './interfaces';
import { fireGameGridEvent, getCoordsFromElement, insertStyles, renderAttributes } from './utils';
import {
  clampCoordsToZoom,
  getRegionAt as computeRegionAt,
  getZoomAround as computeZoomAround,
  getAdjacentRegion,
  getFractionZoom,
  getQuadrantZoom,
  isInsideZoom,
  normalizeZoomBounds,
  regionsEqual,
  resolveAnimate,
} from './zoom';
import { runZoomSlide } from './zoom-render';

export {
  cellTypeEnum,
  classesEnum,
  directionClassEnum,
  directionEnum,
  gridEventsEnum,
  INITIAL_STATE,
  keycodeEnum,
} from './enums';
export type {
  GameGridDOMEvent,
  ICell,
  ICellContext,
  ICellRefresh,
  IConfig,
  IDefaultState,
  IGameGrid,
  IGameGridEventDetail,
  IOptions,
  IRefs,
  IRefsObject,
  IRegionTile,
  IRow,
  IState,
  IZoomBounds,
  IZoomOptions,
  MiddlewareFn,
  StatePatch,
  ZoomQuadrant,
} from './interfaces';

/**
 * Compatibility alias exporting the identical object references as {@link gridEventsEnum}.
 *
 * @category Events
 */
export const gameGridEventsEnum = gridEventsEnum;

/**
 * Stateful 2‑D lattice with collision rules and optional {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement | HTMLElement} projection.
 *
 * @remarks
 * - Implements {@link IGameGrid}. Coordinates are **column-major** tuples `[x,y]` (`matrix[y][x]`).
 * - Methods stay flat. Docs group them by **job**: Matrix, Movement, View, State, Options, Zoom — not DOM vs data.
 * - {@link GameGrid.setCell} / {@link GameGrid.setMatrix} write the matrix only; {@link GameGrid.refreshCells} / {@link GameGrid.refresh} / {@link GameGrid.render} paint.
 * - DOM notification uses bubbling `CustomEvent`s; {@link IGameGridEventDetail} describes `detail`. Event names live on {@link gridEventsEnum}.
 *
 * @groupDescription Matrix
 * Logical grid data. {@link GameGrid.setCell} and {@link GameGrid.setMatrix} do not paint.
 * Call a View method when mounted nodes should catch up. {@link GameGrid.getActiveCell} /
 * {@link GameGrid.getPreviousCell} read matrix fields immediately and overlay `current` from refs.
 *
 * @groupDescription Movement
 * Focus and history. Updates {@link IState}, fires callbacks and {@link gridEventsEnum} events,
 * and highlights the active cell when rendered. Not a matrix write.
 *
 * @groupDescription View
 * Mount, paint, and tear down markup. Optional — omit the constructor container and skip
 * {@link GameGrid.render} for headless use. {@link GameGrid.refreshCells} also writes the matrix
 * when `cell` is provided.
 *
 * @groupDescription State
 * Authoritative {@link IState}. {@link GameGrid.setStateSync} runs middleware and does not emit
 * grid `CustomEvent`s.
 *
 * @groupDescription Options
 * Runtime behaviour toggles. {@link GameGrid.setOptions} does not swap the matrix or re-render.
 *
 * @groupDescription Zoom
 * Viewport window and region tiles. Applying zoom rebuilds the visible window when mounted.
 *
 * @showGroups
 * @category Grid runtime
 *
 * @example Render + keyboard handlers
 * ```ts
 * const grid = new GameGrid({ matrix, options: { wasdControls: true } }, document.querySelector('#stage')!);
 * ```
 *
 * @example Headless state machine without calling render
 * ```ts
 * const grid = new GameGrid({ matrix });
 * grid.moveRight(); // mutates internal state without touching the DOM
 * ```
 */
class GameGrid implements IGameGrid {
  /**
   * @inheritDoc IGameGrid.options
   * @group Options
   */
  public options: IOptions;
  private matrix: ICell[][];
  private state: IState = INITIAL_STATE;
  /**
   * @inheritDoc IGameGrid.refs
   * @group View
   */
  public refs: IRefsObject;
  private appliedZoomViewportClasses: string[] = [];
  private slideRenderBounds: { from: IZoomBounds; to: IZoomBounds } | null = null;
  private lastMoveAt = 0;
  private lastMoveAtByDirection: Partial<Record<directionEnum, number>> = {};

  private getEventTarget(): EventTarget {
    return (
      this.options.eventTarget ??
      (typeof globalThis.window !== 'undefined' ? globalThis.window : globalThis)
    );
  }

  private emit(eventName: string, data?: Record<string, unknown>): void {
    fireGameGridEvent(this.getEventTarget(), this, eventName, data);
  }

  /**
   * Copies matrix/config, merges {@link IConfig.state}, runs {@link GameGrid.render} when `container` is passed, then dispatches {@link gridEventsEnum.CREATED}.
   *
   * @param config - Logical matrix plus optional {@link IConfig.options} / {@link IConfig.state}.
   * @param container - When provided, behaves like invoking {@link GameGrid.render} synchronously afterward.
   */
  constructor(config: IConfig, container?: HTMLElement) {
    this.options = {
      arrowControls: true,
      wasdControls: false,
      infiniteX: false,
      infiniteY: false,
      clickable: true,
      rewindLimit: 20,
      blockOnType: [cellTypeEnum.BARRIER],
      collideOnType: [cellTypeEnum.INTERACTIVE],
      moveOnType: [],
      animateZoom: false,
      constrainToZoom: true,
      zoomSlideDuration: 300,
      slideZoomOnEdge: false,
      injectStyles: true,
      // overrides
      ...config.options,
    };

    this.refs = this.setEmptyRefs();

    this.matrix = config.matrix;
    this.state = {
      ...INITIAL_STATE,
      ...config.state,
    };
    if (this.state.moves.length === 0) {
      this.state.moves = [[...this.state.activeCoords]];
    }

    if (container) {
      this.render(container);
    } else {
      this.refs.cells = this.matrix;
      this.setStateSync({ rendered: false });
    }
    this.emit(gridEventsEnum.CREATED);
  }

  // STATE
  private updateState(obj: StatePatch): void {
    const newState: IState = { ...this.state, ...obj };
    this.state = newState;
  }
  /**
   * @inheritDoc IGameGrid.setStateSync
   * @group State
   */
  public setStateSync(obj: StatePatch): void {
    if (this.options.middlewares?.pre?.length) {
      for (const fn of this.options.middlewares.pre) {
        fn(this, obj);
      }
    }
    this.updateState(obj);
    if (this.options.middlewares?.post?.length) {
      for (const fn of this.options.middlewares.post) {
        fn(this, obj);
      }
    }
  }
  /**
   * @inheritDoc IGameGrid.getState
   * @group State
   */
  public getState(): IState {
    return this.state;
  }

  // DOM MANIPULATION

  private setEmptyRefs(): IRefsObject {
    return {
      container: null,
      rows: [],
      cells: [],
    };
  }

  /**
   * @inheritDoc IGameGrid.refresh
   * @group View
   */
  public refresh(): void {
    const container = this.refs.container;
    if (!container) {
      throw new Error('GameGrid.refresh requires render(container) to have run first.');
    }
    this.rebuildDom();
    this.syncActiveDom(this.state.currentDirection);
  }

  /**
   * @inheritDoc IGameGrid.refreshCells
   * @group View
   */
  public refreshCells(cells: ICellRefresh | ICellRefresh[]): void {
    const items = Array.isArray(cells) ? cells : [cells];
    const refreshed: ICellRefresh[] = [];

    for (const item of items) {
      const x = item.coords[0];
      const y = item.coords[1];
      if (item.cell) {
        this.setCell([x, y], item.cell);
      }
      this.patchCellDom(x, y);
      refreshed.push({
        coords: [x, y],
        cell: this.matrix[y]?.[x],
      });
    }

    this.emit(gridEventsEnum.CELLS_REFRESHED, { cells: refreshed });
  }

  private patchCellDom(x: number, y: number): void {
    const cellData = this.matrix[y]?.[x];
    if (!cellData) {
      return;
    }

    const rendered = Boolean(this.state.rendered && this.refs.container);
    const zoom = this.state.zoom;
    const slide = this.slideRenderBounds;
    const renderBounds = slide ? this.unionSlideBounds(slide.from, slide.to) : zoom;
    const visible = !renderBounds || isInsideZoom([x, y], renderBounds);

    if (!rendered || !visible) {
      this.syncCellRef(x, y, cellData, null);
      return;
    }

    const colCount = zoom ? zoom.maxX - zoom.minX + 1 : (this.matrix[y]?.length ?? 1);
    const isZoomEdge = Boolean(zoom && !slide && this.isZoomEdgeCell(x, y, zoom));
    const nextEl = this.renderCell(y, x, cellData, colCount, isZoomEdge);
    const prevEl = this.refs.cells[y]?.[x]?.current ?? null;

    if (prevEl?.parentNode) {
      prevEl.replaceWith(nextEl);
    } else {
      const rowEl = this.refs.rows.find((row) => row.index === y)?.current;
      if (!rowEl) {
        this.syncCellRef(x, y, cellData, null);
        return;
      }
      this.insertCellInRow(rowEl, nextEl, x);
    }

    this.syncCellRef(x, y, cellData, nextEl);
    this.restoreActiveCellClasses(x, y, nextEl);
  }

  private syncCellRef(x: number, y: number, cellData: ICell, current: HTMLDivElement | null): void {
    if (!this.refs.cells[y] || this.refs.cells === this.matrix) {
      return;
    }
    this.refs.cells[y][x] = {
      ...cellData,
      current,
      coords: [x, y],
    };
  }

  private insertCellInRow(rowEl: HTMLElement, cellEl: HTMLDivElement, x: number): void {
    const children = Array.from(rowEl.children) as HTMLElement[];
    const next = children.find((child) => {
      const coords = getCoordsFromElement(child);
      return coords != null && coords[0] > x;
    });
    if (next) {
      rowEl.insertBefore(cellEl, next);
    } else {
      rowEl.appendChild(cellEl);
    }
  }

  private restoreActiveCellClasses(x: number, y: number, el: HTMLDivElement): void {
    const [ax, ay] = this.state.activeCoords ?? [];
    if (ax !== x || ay !== y) {
      return;
    }
    el.classList.add(classesEnum.ACTIVE_CELL);
    this.options.activeClasses?.forEach((c) => el.classList.add(c));
  }

  private applyInjectedStyles(): void {
    if (this.options.injectStyles === false) return;
    insertStyles();
  }

  private rebuildDom(): void {
    const container = this.refs.container;
    if (!container) {
      return;
    }
    this.dettachHandlers();
    container.replaceChildren();
    this.refs.cells = [];
    this.refs.rows = [];
    this.applyInjectedStyles();
    const fragment = this.renderGrid();
    container.appendChild(fragment);
    this.attachHandlers();
  }

  /**
   * @inheritDoc IGameGrid.render
   * @group View
   */
  public render(container: HTMLElement): void {
    this.applyInjectedStyles();
    this.refs.container = container;
    this.refs.cells = [];
    this.refs.rows = [];
    const fragment = this.renderGrid();
    this.refs.container.appendChild(fragment);
    this.setStateSync({ rendered: true });
    this.emit(gridEventsEnum.RENDERED);
    this.attachHandlers();
    this.syncActiveDom(this.state.currentDirection);
  }

  private renderGrid(): DocumentFragment {
    this.augmentContainer();
    const fragment = document.createDocumentFragment();
    const viewport = document.createElement('div');
    viewport.classList.add(classesEnum.VIEWPORT);
    viewport.setAttribute('data-gamegrid-ref', 'viewport');

    const zoom = this.state.zoom;
    const slide = this.slideRenderBounds;
    const renderBounds = slide ? this.unionSlideBounds(slide.from, slide.to) : zoom;
    const yStart = renderBounds?.minY ?? 0;
    const yEnd = renderBounds?.maxY ?? Math.max(0, this.matrix.length - 1);
    const defaultColCount = (rI: number): number => this.matrix[rI]?.length ?? 1;
    const visibleColCount = zoom ? zoom.maxX - zoom.minX + 1 : null;

    this.refs.cells = this.matrix.map((rowData: ICell[], rI: number) =>
      rowData.map((cellData: ICell, cI: number) => ({
        ...cellData,
        current: null,
        coords: [cI, rI],
      })),
    );
    this.refs.rows = [];

    for (let rI = yStart; rI <= yEnd; rI++) {
      const rowData = this.matrix[rI];
      if (!rowData) {
        continue;
      }

      const xStart = renderBounds ? renderBounds.minX : 0;
      const xEnd = renderBounds
        ? Math.min(renderBounds.maxX, rowData.length - 1)
        : rowData.length - 1;
      const colCount = visibleColCount ?? defaultColCount(rI);
      const row: HTMLDivElement = this.renderRow(rI);

      for (let cI = xStart; cI <= xEnd; cI++) {
        const cellData = rowData[cI];
        if (!cellData) {
          continue;
        }
        const isZoomEdge = zoom && !slide ? this.isZoomEdgeCell(cI, rI, zoom) : false;
        const cell: HTMLDivElement = this.renderCell(rI, cI, cellData, colCount, isZoomEdge);
        row.appendChild(cell);
        this.refs.cells[rI][cI] = {
          ...cellData,
          current: cell,
          coords: [cI, rI],
        };
      }

      this.refs.rows.push({
        index: rI,
        cells: this.refs.cells[rI],
        current: row,
      });
      viewport.appendChild(row);
    }

    fragment.appendChild(viewport);
    this.syncZoomDom(viewport);
    return fragment;
  }

  private isZoomEdgeCell(cI: number, rI: number, zoom: IZoomBounds): boolean {
    return cI === zoom.minX || cI === zoom.maxX || rI === zoom.minY || rI === zoom.maxY;
  }

  private unionSlideBounds(from: IZoomBounds, to: IZoomBounds): IZoomBounds {
    return {
      minX: Math.min(from.minX, to.minX),
      minY: Math.min(from.minY, to.minY),
      maxX: Math.max(from.maxX, to.maxX),
      maxY: Math.max(from.maxY, to.maxY),
    };
  }

  private getFullMatrixBounds(): IZoomBounds {
    const height = this.matrix.length;
    let width = 0;
    for (const row of this.matrix) {
      width = Math.max(width, row.length);
    }
    return {
      minX: 0,
      minY: 0,
      maxX: Math.max(0, width - 1),
      maxY: Math.max(0, height - 1),
    };
  }

  private syncZoomDom(viewportEl?: HTMLElement | null): void {
    const container = this.refs.container;
    if (!container) {
      return;
    }

    const viewport =
      viewportEl ??
      (container.querySelector('[data-gamegrid-ref="viewport"]') as HTMLElement | null);
    if (!viewport) {
      return;
    }

    for (const cls of this.appliedZoomViewportClasses) {
      viewport.classList.remove(cls);
    }
    this.appliedZoomViewportClasses = [];

    const zoom = this.state.zoom;
    if (zoom) {
      container.classList.add(classesEnum.GRID_ZOOMED);
      viewport.setAttribute(
        'data-gamegrid-zoom',
        `${zoom.minX},${zoom.minY},${zoom.maxX},${zoom.maxY}`,
      );
      if (this.state.region?.quadrant) {
        viewport.setAttribute('data-gamegrid-region', this.state.region.quadrant);
      } else {
        viewport.removeAttribute('data-gamegrid-region');
      }
      if (this.options.zoomViewportClasses) {
        for (const cls of this.options.zoomViewportClasses) {
          viewport.classList.add(cls);
          this.appliedZoomViewportClasses.push(cls);
        }
      }
    } else {
      container.classList.remove(classesEnum.GRID_ZOOMED);
      viewport.removeAttribute('data-gamegrid-zoom');
      viewport.removeAttribute('data-gamegrid-region');
    }
  }

  private augmentContainer(): void {
    if (this.refs.container !== null) {
      this.refs.container.classList.add(classesEnum.GRID);
      if (this.options.containerClasses) {
        this.options.containerClasses.forEach((containerClass: string) =>
          this.refs.container!.classList.add(containerClass),
        );
      }
      this.refs.container.setAttribute('tabindex', '0');
      this.refs.container.setAttribute('data-gamegrid-ref', 'container');
    } else {
      throw new Error('No container element found');
    }
  }

  private renderRow(rI: number): HTMLDivElement {
    const row: HTMLDivElement = document.createElement('div');
    if (this.options.rowClasses) {
      this.options.rowClasses.forEach((rowClass: string) => row.classList.add(rowClass));
    }
    row.setAttribute('data-gamegrid-row-index', rI.toString());
    row.setAttribute('data-gamegrid-ref', 'row');
    row.classList.add(classesEnum.ROW);
    return row;
  }

  private renderCell(
    rI: number,
    cI: number,
    cellData: ICell,
    colCount: number,
    isZoomEdge = false,
  ): HTMLDivElement {
    const cell: HTMLDivElement = document.createElement('div');
    renderAttributes(cell, [
      ['data-gamegrid-ref', 'cell'],
      ['data-gamegrid-coords', `${cI},${rI}`],
      ['data-gamegrid-cell-type', cellData.type || cellTypeEnum.OPEN],
    ]);

    cell.style.width = `${100 / colCount}%`;
    const reservedCellAttributes = new Set([
      'data-gamegrid-ref',
      'data-gamegrid-coords',
      'data-gamegrid-cell-type',
    ]);
    cellData.cellAttributes?.forEach((attr: string[]) => {
      if (reservedCellAttributes.has(attr[0])) {
        return;
      }
      cell.setAttribute(attr[0], attr[1]);
    });

    cell.classList.add(classesEnum.CELL);
    if (isZoomEdge) {
      cell.classList.add(classesEnum.CELL_ZOOM_EDGE);
    }
    if (this.options.cellClasses) {
      this.options.cellClasses.forEach((cellClass: string) => {
        cell.classList.add(cellClass);
      });
    }

    if (cellData.render) {
      cell.appendChild(
        cellData.render({
          coords: [cI, rI],
          cell: cellData,
          gamegrid: this,
        }),
      );
    }
    return cell;
  }

  /**
   * @inheritDoc IGameGrid.setActiveCell
   * @group Movement
   */
  public setActiveCell(x: number, y: number, direction?: string): void {
    const requestedX = x;
    const requestedY = y;
    const boundaryCheckData = this.getValidXandY(x, y);

    x = boundaryCheckData.x;
    y = boundaryCheckData.y;

    const [currentX, currentY] = this.getState().activeCoords!;
    const prevCoords: [number, number] = [currentX, currentY];

    let hitsBlock = this.isBlockingCell(x, y);
    if (
      boundaryCheckData.zoomEdge &&
      (requestedX !== x || requestedY !== y) &&
      this.isBlockingCell(requestedX, requestedY)
    ) {
      hitsBlock = true;
    }

    const nextCoords = hitsBlock ? [...this.state.activeCoords] : [x, y];
    this.setStateSync({
      activeCoords: nextCoords,
      prevCoords: this.state.activeCoords,
      moves: this.createNewMovesArray(nextCoords),
      currentDirection: direction,
    });

    if (hitsBlock) {
      this.emit(gridEventsEnum.MOVE_BLOCKED);
      this.options.callbacks?.onBlock?.(this, this.getState());
    }

    this.emitCollideAndDettach(prevCoords, nextCoords);
    this.emitCellEventTypes(prevCoords, nextCoords);

    if (boundaryCheckData.eventName) {
      this.emit(boundaryCheckData.eventName);
    }
    if (boundaryCheckData.callbackFunction) {
      boundaryCheckData.callbackFunction(this, this.getState());
    }
    if (boundaryCheckData.wrapped) {
      this.options.callbacks?.onWrap?.(this, this.getState());
      this.emit(gridEventsEnum.WRAP);
    }

    if (boundaryCheckData.bounded) {
      this.options.callbacks?.onBoundary?.(this, this.getState());
      this.emit(gridEventsEnum.BOUNDARY);
    }

    let deferredActiveSync = false;
    if (boundaryCheckData.zoomEdge) {
      const zoom = this.state.zoom!;
      this.emit(gridEventsEnum.ZOOM_EDGE, {
        direction,
        zoom,
        activeCoords: [...this.getState().activeCoords!],
      });
      this.options.callbacks?.onZoomEdge?.(this, this.getState());
      if (!hitsBlock) {
        deferredActiveSync = this.handleSlideZoomOnEdge(direction);
      }
    }

    this.emitLand(prevCoords, nextCoords);

    if (!this.coordsEqual(prevCoords, nextCoords)) {
      this.handleZoomExit(prevCoords, direction);
      this.handleRegionChange(prevCoords);
    }

    if (!deferredActiveSync) {
      this.syncActiveDom(direction);
    }
  }

  private handleSlideZoomOnEdge(direction?: string): boolean {
    if (!this.options.slideZoomOnEdge || !direction) {
      return false;
    }

    const divisions = this.options.regionDivisions;
    if (!divisions || divisions < 2) {
      return false;
    }

    const activeCoords = this.getState().activeCoords!;
    const tile = this.state.region ?? computeRegionAt(this.matrix, activeCoords, divisions);
    const next = getAdjacentRegion(tile, direction);
    if (!next) {
      return false;
    }

    this.zoomFraction(next.divisions, next.tileX, next.tileY, {
      animate: resolveAnimate(undefined, this.options.animateZoom),
    });
    return true;
  }

  private handleZoomExit(prevCoords: [number, number], direction?: string): void {
    const zoom = this.state.zoom;
    if (!zoom || this.options.constrainToZoom !== false) {
      return;
    }

    const activeCoords = this.getState().activeCoords!;
    if (isInsideZoom(prevCoords, zoom) && !isInsideZoom(activeCoords, zoom)) {
      this.emit(gridEventsEnum.ZOOM_EXIT, {
        direction,
        zoom,
        activeCoords: [...activeCoords],
        prevCoords: [...prevCoords],
      });
      this.options.callbacks?.onZoomExit?.(this, this.getState());
    }
  }

  private handleRegionChange(prevCoords: [number, number]): void {
    const divisions = this.options.regionDivisions;
    if (!divisions || divisions < 2) {
      return;
    }

    const activeCoords = this.getState().activeCoords!;
    if (prevCoords[0] === activeCoords[0] && prevCoords[1] === activeCoords[1]) {
      return;
    }

    const from = computeRegionAt(this.matrix, prevCoords, divisions);
    const to = computeRegionAt(this.matrix, activeCoords, divisions);
    if (regionsEqual(from, to)) {
      return;
    }

    this.setStateSync({ region: to });
    this.syncZoomDom();
    this.emit(gridEventsEnum.REGION_CHANGE, { from, to });
    this.options.callbacks?.onRegionChange?.(this, this.getState());
  }

  private syncActiveDirectionClasses(direction?: string): void {
    for (const key in directionClassEnum) {
      this.refs.container?.classList.remove(directionClassEnum[key]);
    }
    if (direction) {
      this.refs.container?.classList.add(directionClassEnum[direction]);
    }
  }

  private syncActiveDom(direction?: string): void {
    if (!this.getState().rendered) return;
    this.removeActiveClasses();
    const [nx, ny] = this.getState().activeCoords!;
    const cell = this.refs.cells[ny]?.[nx];
    cell?.current?.classList.add(classesEnum.ACTIVE_CELL);
    this.syncActiveDirectionClasses(direction);
    this.options.activeClasses?.forEach((c) => cell?.current?.classList.add(c));
  }

  private removeActiveClasses(): void {
    this.refs.cells.forEach((cellRow) => {
      cellRow.forEach((cell: ICell) => {
        cell.current?.classList.remove(classesEnum.ACTIVE_CELL);
      });
    });
  }

  private containerBlur = (): void => {
    if (this.options.containerClasses) {
      this.options.containerClasses.forEach((containerClass: string) => {
        this.refs.container?.classList.remove(containerClass);
      });
    }
  };

  /**
   * @inheritDoc IGameGrid.getActiveCell
   * @group Matrix
   */
  public getActiveCell(): ICell {
    return this.cellAt(this.state.activeCoords);
  }

  /**
   * @inheritDoc IGameGrid.getPreviousCell
   * @group Matrix
   */
  public getPreviousCell(): ICell {
    return this.cellAt(this.state.prevCoords);
  }

  /**
   * Logical matrix cell at `coords`, with mounted `current` / `coords` from refs when present.
   * After {@link GameGrid.setCell}, data fields match {@link GameGrid.getCell}; the painted node
   * stays on `current` until {@link GameGrid.refreshCells} / {@link GameGrid.refresh}.
   */
  private cellAt(coords: readonly [number, number] | number[]): ICell {
    const x = coords[0];
    const y = coords[1];
    const data = this.matrix[y][x];
    if (this.refs.cells === this.matrix) {
      return data;
    }
    const ref = this.refs.cells[y]?.[x];
    return {
      ...data,
      current: ref?.current ?? data.current,
      coords: ref?.coords ?? data.coords ?? [x, y],
    };
  }

  /**
   * @inheritDoc IGameGrid.getCell
   * @group Matrix
   */
  public getCell(coords: readonly [number, number] | number[]): ICell {
    const x = coords[0];
    const y = coords[1];
    return this.matrix[y][x];
  }

  /**
   * @inheritDoc IGameGrid.setCell
   * @group Matrix
   */
  public setCell(coords: readonly [number, number] | number[], cell: ICell): void {
    const x = coords[0];
    const y = coords[1];
    this.matrix[y][x] = cell;
  }

  /**
   * @inheritDoc IGameGrid.getAllCellsByType
   * @group Matrix
   */
  public getAllCellsByType(type: string): ICell[] {
    const cells: ICell[] = [];
    this.matrix.forEach((row: ICell[], rI: number) => {
      row.forEach((cell: ICell, cI: number) => {
        if (cell.type === type) {
          cells.push(this.getCell([cI, rI]));
        }
      });
    });
    return cells;
  }

  private getMoveDebounceDelay(direction: directionEnum): number | undefined {
    const debounce = this.options.moveDebounce;
    if (debounce === undefined) {
      return undefined;
    }
    if (typeof debounce === 'number') {
      return debounce;
    }
    const directionIndex: Record<directionEnum, number> = {
      [directionEnum.UP]: 0,
      [directionEnum.RIGHT]: 1,
      [directionEnum.DOWN]: 2,
      [directionEnum.LEFT]: 3,
    };
    return debounce[directionIndex[direction]];
  }

  private canAcceptMove(direction: directionEnum): boolean {
    const delay = this.getMoveDebounceDelay(direction);
    if (delay === undefined) {
      return true;
    }

    const now = Date.now();
    if (typeof this.options.moveDebounce === 'number') {
      if (now - this.lastMoveAt < delay) {
        return false;
      }
      this.lastMoveAt = now;
      return true;
    }

    const lastAt = this.lastMoveAtByDirection[direction] ?? 0;
    if (now - lastAt < delay) {
      return false;
    }
    this.lastMoveAtByDirection[direction] = now;
    return true;
  }

  /**
   * @inheritDoc IGameGrid.moveUp
   * @group Movement
   */
  public moveUp(): void {
    if (!this.canAcceptMove(directionEnum.UP)) {
      return;
    }
    this.options.callbacks?.onMove?.(this, this.getState());
    this.emit(gridEventsEnum.MOVE_UP);

    this.setActiveCell(
      this.state.activeCoords![0],
      this.state.activeCoords![1] - 1,
      directionEnum.UP,
    );
  }

  /**
   * @inheritDoc IGameGrid.moveRight
   * @group Movement
   */
  public moveRight(): void {
    if (!this.canAcceptMove(directionEnum.RIGHT)) {
      return;
    }
    this.options.callbacks?.onMove?.(this, this.getState());
    this.emit(gridEventsEnum.MOVE_RIGHT);

    this.setActiveCell(
      this.state.activeCoords![0] + 1,
      this.state.activeCoords![1],
      directionEnum.RIGHT,
    );
  }

  /**
   * @inheritDoc IGameGrid.moveDown
   * @group Movement
   */
  public moveDown(): void {
    if (!this.canAcceptMove(directionEnum.DOWN)) {
      return;
    }
    this.options.callbacks?.onMove?.(this, this.getState());
    this.emit(gridEventsEnum.MOVE_DOWN);

    this.setActiveCell(
      this.state.activeCoords![0],
      this.state.activeCoords![1] + 1,
      directionEnum.DOWN,
    );
  }

  /**
   * @inheritDoc IGameGrid.moveLeft
   * @group Movement
   */
  public moveLeft(): void {
    if (!this.canAcceptMove(directionEnum.LEFT)) {
      return;
    }
    this.options.callbacks?.onMove?.(this, this.getState());
    this.emit(gridEventsEnum.MOVE_LEFT);

    this.setActiveCell(
      this.state.activeCoords![0] - 1,
      this.state.activeCoords![1],
      directionEnum.LEFT,
    );
  }

  /**
   * @inheritDoc IGameGrid.rewind
   * @group Movement
   */
  public rewind(steps = 1): void {
    if (!Number.isFinite(steps) || steps <= 0) {
      return;
    }
    const moves = this.getState().moves;
    if (moves.length <= 1) {
      return;
    }
    const clampedSteps = Math.min(Math.floor(steps), moves.length - 1);
    this.applyRewindToIndex(moves.length - 1 - clampedSteps, clampedSteps);
  }

  /**
   * @inheritDoc IGameGrid.rewindTo
   * @group Movement
   */
  public rewindTo(index: number): void {
    if (!Number.isInteger(index)) {
      return;
    }
    const moves = this.getState().moves;
    if (index < 0 || index >= moves.length || index === moves.length - 1) {
      return;
    }
    this.applyRewindToIndex(index, moves.length - 1 - index);
  }

  /// MOVEMENT HELPERS
  private getRewindLimit(): number {
    const limit = this.options.rewindLimit;
    if (typeof limit !== 'number' || !Number.isFinite(limit) || limit < 1) {
      return 1;
    }
    return Math.floor(limit);
  }

  private coordsEqual(a: number[], b: number[]): boolean {
    return a[0] === b[0] && a[1] === b[1];
  }

  private directionBetween(from: number[], to: number[]): string | undefined {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    if (dx === 0 && dy === 0) {
      return undefined;
    }
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx > 0 ? directionEnum.RIGHT : directionEnum.LEFT;
    }
    return dy > 0 ? directionEnum.DOWN : directionEnum.UP;
  }

  private cloneMoves(moves: number[][]): number[][] {
    return moves.map((coords) => [...coords]);
  }

  private trimMovesToLimit(moves: number[][] = this.getState().moves): number[][] {
    const cloned = this.cloneMoves(moves);
    const limit = this.getRewindLimit();
    if (cloned.length > limit) {
      return cloned.slice(cloned.length - limit);
    }
    return cloned;
  }

  private createNewMovesArray(nextCoords: number[]): number[][] {
    const clonedMoves = this.cloneMoves(this.getState().moves);
    const last = clonedMoves[clonedMoves.length - 1];
    if (last && this.coordsEqual(last, nextCoords)) {
      return this.trimMovesToLimit(clonedMoves);
    }
    clonedMoves.push([...nextCoords]);
    return this.trimMovesToLimit(clonedMoves);
  }

  private applyRewindToIndex(index: number, steps: number): void {
    const moves = this.getState().moves;
    const target = moves[index];
    const [currentX, currentY] = this.getState().activeCoords;
    const prevCoords: [number, number] = [currentX, currentY];
    const nextCoords = [...target];
    const direction = this.directionBetween(prevCoords, nextCoords);

    this.setStateSync({
      activeCoords: nextCoords,
      prevCoords,
      moves: this.cloneMoves(moves.slice(0, index + 1)),
      currentDirection: direction,
    });

    this.emitCollideAndDettach(prevCoords, nextCoords);
    this.emitCellEventTypes(prevCoords, nextCoords);

    this.emit(gridEventsEnum.REWIND, { steps, index });
    this.options.callbacks?.onRewind?.(this, this.getState());

    this.emitLand(prevCoords, nextCoords);

    this.handleZoomExit(prevCoords, direction);
    this.handleRegionChange(prevCoords);
    this.syncActiveDom(direction);
  }

  private emitCollideAndDettach(from: number[], to: number[]): void {
    if (this.coordsEqual(from, to)) {
      return;
    }
    const wasAttached = this.isCollidingCell(from[0], from[1]);
    const landedCollide = this.isCollidingCell(to[0], to[1]);
    if (landedCollide) {
      this.emit(gridEventsEnum.MOVE_COLLISION);
      this.options.callbacks?.onCollide?.(this, this.getState());
    }
    if (wasAttached && !landedCollide) {
      this.emit(gridEventsEnum.MOVE_DETTACH);
      this.options.callbacks?.onDettach?.(this, this.getState());
    }
  }

  private emitCellEventTypes(from: number[], to: number[]): void {
    if (this.coordsEqual(from, to)) {
      return;
    }
    const leaving = this.getCell(from);
    const entering = this.getCell(to);
    if (leaving?.eventTypes?.onExit) {
      this.emit(leaving.eventTypes.onExit, { coords: [...from], cell: leaving });
    }
    if (entering?.eventTypes?.onEnter) {
      this.emit(entering.eventTypes.onEnter, { coords: [...to], cell: entering });
    }
  }

  private emitLand(from: number[], to: number[]): void {
    if (this.coordsEqual(from, to)) {
      return;
    }
    this.emit(gridEventsEnum.MOVE_LAND);
    this.options.callbacks?.onLand?.(this, this.getState());
  }

  private getValidXandY(
    nextX: number,
    nextY: number,
  ): {
    x: number;
    y: number;
    eventName: string | undefined;
    callbackFunction: ((arg0: IGameGrid, arg1: IState) => void) | undefined;
    wrapped: boolean;
    bounded: boolean;
    zoomEdge: boolean;
  } {
    const zoom = this.state.zoom;
    const useZoom = zoom !== null && this.options.constrainToZoom !== false;

    let yMin = 0;
    let yMax = Math.max(0, this.matrix.length - 1);
    if (useZoom) {
      yMin = zoom.minY;
      yMax = zoom.maxY;
    }

    let y = nextY;
    let wrapped = false;
    let bounded = false;
    let zoomEdge = false;
    let eventName: string | undefined;
    let callbackFunction: ((arg0: IGameGrid, arg1: IState) => void) | undefined;

    if (nextY < yMin) {
      if (this.options.infiniteY) {
        y = yMax;
        callbackFunction = this.options.callbacks?.onWrapY;
        eventName = gridEventsEnum.WRAP_Y;
        wrapped = true;
      } else {
        y = yMin;
        callbackFunction = this.options.callbacks?.onBoundaryY;
        eventName = gridEventsEnum.BOUNDARY_Y;
        bounded = true;
        if (useZoom) {
          zoomEdge = true;
        }
      }
    } else if (nextY > yMax) {
      if (this.options.infiniteY) {
        y = yMin;
        callbackFunction = this.options.callbacks?.onWrapY;
        eventName = gridEventsEnum.WRAP_Y;
        wrapped = true;
      } else {
        y = yMax;
        callbackFunction = this.options.callbacks?.onBoundaryY;
        eventName = gridEventsEnum.BOUNDARY_Y;
        bounded = true;
        if (useZoom) {
          zoomEdge = true;
        }
      }
    } else {
      y = nextY;
    }

    const row = this.matrix[y];
    let xMin = 0;
    let xMax = row && row.length > 0 ? row.length - 1 : 0;
    if (useZoom) {
      xMin = zoom.minX;
      xMax = Math.min(zoom.maxX, xMax);
    }

    let x = nextX;
    if (nextX < xMin) {
      if (this.options.infiniteX) {
        x = xMax;
        callbackFunction = this.options.callbacks?.onWrapX;
        eventName = gridEventsEnum.WRAP_X;
        wrapped = true;
      } else {
        x = xMin;
        callbackFunction = this.options.callbacks?.onBoundaryX;
        eventName = gridEventsEnum.BOUNDARY_X;
        bounded = true;
        if (useZoom) {
          zoomEdge = true;
        }
      }
    } else if (nextX > xMax) {
      if (this.options.infiniteX) {
        x = xMin;
        callbackFunction = this.options.callbacks?.onWrapX;
        eventName = gridEventsEnum.WRAP_X;
        wrapped = true;
      } else {
        x = xMax;
        callbackFunction = this.options.callbacks?.onBoundaryX;
        eventName = gridEventsEnum.BOUNDARY_X;
        bounded = true;
        if (useZoom) {
          zoomEdge = true;
        }
      }
    } else {
      x = nextX;
    }

    const maxX = Math.max(xMin, (this.matrix[y]?.length ?? 1) - 1);
    if (useZoom) {
      x = Math.min(Math.max(xMin, x), Math.min(zoom.maxX, maxX));
    } else {
      x = Math.min(Math.max(0, x), maxX);
    }

    return {
      x,
      y,
      eventName,
      callbackFunction,
      wrapped,
      bounded,
      zoomEdge,
    };
  }

  private normalizedCellType(x: number, y: number): string {
    return this.matrix[y]?.[x]?.type ?? cellTypeEnum.OPEN;
  }

  private isBlockingCell(x: number, y: number): boolean {
    const t = this.normalizedCellType(x, y);
    if (this.options.blockOnType?.includes(t)) return true;
    const allow = this.options.moveOnType;
    if (allow && allow.length > 0 && !allow.includes(t)) return true;
    return false;
  }

  private isCollidingCell(x: number, y: number): boolean {
    return this.options.collideOnType?.includes(this.normalizedCellType(x, y)) ?? false;
  }

  // EVENT HANDLERS
  private handleDirection(event: KeyboardEvent): void {
    switch (event.code) {
      case keycodeEnum.ArrowLeft: {
        //left
        this.moveLeft();
        break;
      }
      case keycodeEnum.KeyLeft: {
        //left
        this.moveLeft();
        break;
      }
      case keycodeEnum.ArrowUp: {
        //up
        this.moveUp();
        break;
      }
      case keycodeEnum.KeyUp: {
        //up
        this.moveUp();
        break;
      }
      case keycodeEnum.ArrowRight: {
        //right
        this.moveRight();
        break;
      }
      case keycodeEnum.KeyRight: {
        //right
        this.moveRight();
        break;
      }
      case keycodeEnum.ArrowDown: {
        //down
        this.moveDown();
        break;
      }
      case keycodeEnum.KeyDown: {
        //down
        this.moveDown();
        break;
      }
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.options.arrowControls) {
      if (
        event.code === keycodeEnum.ArrowUp ||
        event.code === keycodeEnum.ArrowRight ||
        event.code === keycodeEnum.ArrowDown ||
        event.code === keycodeEnum.ArrowLeft
      ) {
        event.preventDefault();
        this.handleDirection(event);
      }
    }
    if (this.options.wasdControls) {
      if (
        event.code === keycodeEnum.KeyUp ||
        event.code === keycodeEnum.KeyRight ||
        event.code === keycodeEnum.KeyDown ||
        event.code === keycodeEnum.KeyLeft
      ) {
        event.preventDefault();
        this.handleDirection(event);
      }
    }
  };

  private handleCellClick = (event: MouseEvent): void => {
    if (!this.getOptions().clickable) {
      return;
    }
    const raw = event.target;
    const from = raw instanceof Element ? raw : raw instanceof Node ? raw.parentElement : null;
    if (!from) {
      return;
    }
    const cellEl = from.closest('[data-gamegrid-ref="cell"]');
    if (!(cellEl instanceof HTMLElement)) {
      return;
    }
    const coords = getCoordsFromElement(cellEl);
    if (!coords) {
      return;
    }
    this.setActiveCell(coords[0], coords[1]);
  };

  /**
   * @inheritDoc IGameGrid.getOptions
   * @group Options
   */
  public getOptions(): IOptions {
    return this.options;
  }
  /**
   * @inheritDoc IGameGrid.setOptions
   * @group Options
   */
  public setOptions(newOptions: IOptions): void {
    this.options = { ...this.options, ...newOptions };
    if (newOptions.rewindLimit !== undefined) {
      const trimmed = this.trimMovesToLimit();
      if (trimmed.length !== this.getState().moves.length) {
        this.setStateSync({ moves: trimmed });
      }
    }
  }
  /**
   * @inheritDoc IGameGrid.destroy
   * @group View
   */
  public destroy(): void {
    const rendered = this.state.rendered;
    const container = this.refs.container;
    if (container && rendered) {
      this.dettachHandlers();
      container.replaceChildren();
      container.classList.remove(classesEnum.GRID);
      container.classList.remove(classesEnum.GRID_ZOOMED);
      container.classList.remove(classesEnum.GRID_ZOOM_ANIMATING);
      this.options.containerClasses?.forEach((cl) => container.classList.remove(cl));
      this.refs.rows = [];
      this.refs.cells = [];
    }
    this.setStateSync({ rendered: false });
    this.emit(gridEventsEnum.DESTROYED);
  }

  /**
   * @inheritDoc IGameGrid.setMatrix
   * @group Matrix
   */
  public setMatrix(m: ICell[][]): void {
    this.matrix = m;
    if (!this.state.rendered) {
      this.refs.cells = m;
    }
  }

  /**
   * @inheritDoc IGameGrid.getMatrix
   * @group Matrix
   */
  public getMatrix(): ICell[][] {
    return this.matrix;
  }

  /**
   * @inheritDoc IGameGrid.getZoom
   * @group Zoom
   */
  public getZoom(): IZoomBounds | null {
    return this.state.zoom;
  }

  /**
   * @inheritDoc IGameGrid.setZoom
   * @group Zoom
   */
  public setZoom(bounds: IZoomBounds, options?: IZoomOptions): void {
    const fromZoom = this.state.zoom;
    const normalized = normalizeZoomBounds(bounds, this.matrix);
    const animate = resolveAnimate(options, this.options.animateZoom);
    const activeCoords = this.getState().activeCoords!;
    const clamped = clampCoordsToZoom(activeCoords, normalized);
    if (
      (activeCoords[0] !== clamped[0] || activeCoords[1] !== clamped[1]) &&
      this.isBlockingCell(clamped[0], clamped[1])
    ) {
      this.options.callbacks?.onBlock?.(this, this.getState());
      return;
    }
    const patch: StatePatch = { zoom: normalized };

    if (activeCoords[0] !== clamped[0] || activeCoords[1] !== clamped[1]) {
      patch.activeCoords = clamped;
      patch.prevCoords = activeCoords;
    }

    const divisions = this.options.regionDivisions;
    if (divisions && divisions >= 2) {
      patch.region = computeRegionAt(this.matrix, clamped, divisions);
    }

    this.setStateSync(patch);

    if (this.state.rendered) {
      const container = this.refs.container;
      const viewport = container?.querySelector(
        '[data-gamegrid-ref="viewport"]',
      ) as HTMLElement | null;

      if (animate && fromZoom && container && viewport) {
        const duration = this.options.zoomSlideDuration ?? 300;
        this.slideRenderBounds = { from: fromZoom, to: normalized };
        runZoomSlide(container, viewport, fromZoom, normalized, duration, () => {
          this.rebuildDom();
          this.syncActiveDom(this.state.currentDirection);
        }).then(() => {
          this.slideRenderBounds = null;
          this.rebuildDom();
          this.emitZoomSet(animate, normalized);
          this.syncActiveDom(this.state.currentDirection);
        });
        return;
      }

      this.refresh();
    }

    this.emitZoomSet(animate, normalized);
    this.syncActiveDom(this.state.currentDirection);
  }

  /**
   * @inheritDoc IGameGrid.clearZoom
   * @group Zoom
   */
  public clearZoom(options?: IZoomOptions): void {
    const fromZoom = this.state.zoom;
    const animate = resolveAnimate(options, this.options.animateZoom);
    const fullBounds = this.getFullMatrixBounds();

    this.setStateSync({ zoom: null });

    if (this.state.rendered) {
      const container = this.refs.container;
      const viewport = container?.querySelector(
        '[data-gamegrid-ref="viewport"]',
      ) as HTMLElement | null;

      if (animate && fromZoom && container && viewport) {
        const duration = this.options.zoomSlideDuration ?? 300;
        this.slideRenderBounds = { from: fromZoom, to: fullBounds };
        runZoomSlide(container, viewport, fromZoom, fullBounds, duration, () => {
          this.rebuildDom();
          this.syncActiveDom(this.state.currentDirection);
        }).then(() => {
          this.slideRenderBounds = null;
          this.rebuildDom();
          this.emitZoomCleared(animate);
          this.syncActiveDom(this.state.currentDirection);
        });
        return;
      }

      this.refresh();
    }

    this.emitZoomCleared(animate);
    this.syncActiveDom(this.state.currentDirection);
  }

  private emitZoomSet(animate: boolean, zoom: IZoomBounds): void {
    this.emit(gridEventsEnum.ZOOM_SET, { animate, zoom });
    this.options.callbacks?.onZoomSet?.(this, this.getState());
  }

  private emitZoomCleared(animate: boolean): void {
    this.emit(gridEventsEnum.ZOOM_CLEARED, { animate, zoom: null });
    this.options.callbacks?.onZoomCleared?.(this, this.getState());
  }

  /**
   * @inheritDoc IGameGrid.getZoomAround
   * @group Zoom
   */
  public getZoomAround(
    center: readonly [number, number] | number[],
    radiusX: number,
    radiusY?: number,
  ): IZoomBounds {
    return computeZoomAround(this.matrix, center, radiusX, radiusY);
  }

  /**
   * @inheritDoc IGameGrid.getQuadrantZoom
   * @group Zoom
   */
  public getQuadrantZoom(quadrant: ZoomQuadrant): IZoomBounds {
    return getQuadrantZoom(this.matrix, quadrant);
  }

  /**
   * @inheritDoc IGameGrid.getFractionZoom
   * @group Zoom
   */
  public getFractionZoom(divisions: number, tileX: number, tileY: number): IZoomBounds {
    return getFractionZoom(this.matrix, divisions, tileX, tileY);
  }

  /**
   * @inheritDoc IGameGrid.zoomAround
   * @group Zoom
   */
  public zoomAround(
    center: readonly [number, number] | number[],
    radiusX: number,
    radiusY?: number,
    options?: IZoomOptions,
  ): void {
    this.setZoom(this.getZoomAround(center, radiusX, radiusY), options);
  }

  /**
   * @inheritDoc IGameGrid.zoomQuadrant
   * @group Zoom
   */
  public zoomQuadrant(quadrant: ZoomQuadrant, options?: IZoomOptions): void {
    this.setZoom(this.getQuadrantZoom(quadrant), options);
  }

  /**
   * @inheritDoc IGameGrid.zoomFraction
   * @group Zoom
   */
  public zoomFraction(
    divisions: number,
    tileX: number,
    tileY: number,
    options?: IZoomOptions,
  ): void {
    this.setZoom(this.getFractionZoom(divisions, tileX, tileY), options);
  }

  /**
   * @inheritDoc IGameGrid.getRegionAt
   * @group Zoom
   */
  public getRegionAt(
    coords: readonly [number, number] | number[],
    divisions?: number,
  ): IRegionTile {
    const resolvedDivisions = divisions ?? this.options.regionDivisions;
    if (!resolvedDivisions || resolvedDivisions < 2) {
      throw new Error('regionDivisions must be >= 2');
    }
    return computeRegionAt(this.matrix, coords, resolvedDivisions);
  }

  /**
   * @inheritDoc IGameGrid.getActiveRegion
   * @group Zoom
   */
  public getActiveRegion(): IRegionTile | null {
    if (this.state.region) {
      return this.state.region;
    }
    const divisions = this.options.regionDivisions;
    if (!divisions || divisions < 2) {
      return null;
    }
    return computeRegionAt(this.matrix, this.getState().activeCoords!, divisions);
  }

  private attachHandlers(): void {
    const container = this.refs.container;
    if (container) {
      container.addEventListener('keydown', this.handleKeyDown);
      container.addEventListener('blur', this.containerBlur);
      container.addEventListener('click', this.handleCellClick);
    }
  }

  private dettachHandlers(): void {
    const container = this.refs.container;
    if (container) {
      container.removeEventListener('keydown', this.handleKeyDown);
      container.removeEventListener('blur', this.containerBlur);
      container.removeEventListener('click', this.handleCellClick);
    }
  }
}

export { GameGrid };
export default GameGrid;
