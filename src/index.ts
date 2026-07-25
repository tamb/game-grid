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
 */
export const gameGridEventsEnum = gridEventsEnum;

/**
 * Stateful 2‑D lattice with collision rules and optional {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement | HTMLElement} projection.
 *
 * @remarks
 * - Implements {@link IGameGrid}. Coordinates are **column-major** tuples `[x,y]` (`matrix[y][x]`).
 * - DOM notification uses bubbling `CustomEvent`s; {@link IGameGridEventDetail} describes `detail`. Event names live on {@link gridEventsEnum}.
 *
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
  /** @inheritDoc IGameGrid.options */
  public options: IOptions;
  private matrix: ICell[][];
  private state: IState = INITIAL_STATE;
  /** @inheritDoc IGameGrid.refs */
  public refs: IRefsObject;
  private appliedZoomViewportClasses: string[] = [];
  private slideRenderBounds: { from: IZoomBounds; to: IZoomBounds } | null = null;

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
      // overrides
      ...config.options,
    };

    this.refs = this.setEmptyRefs();

    this.matrix = config.matrix;
    this.state = {
      ...INITIAL_STATE,
      ...config.state,
    };

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
  /** @inheritDoc IGameGrid.setStateSync */
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
  /** @inheritDoc IGameGrid.getState */
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

  /** @inheritDoc IGameGrid.refresh */
  public refresh(): void {
    const container = this.refs.container;
    if (!container) {
      throw new Error('GameGrid.refresh requires render(container) to have run first.');
    }
    this.rebuildDom();
    this.syncActiveDom(this.state.currentDirection);
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
    insertStyles();
    const fragment = this.renderGrid();
    container.appendChild(fragment);
    this.attachHandlers();
  }

  /** @inheritDoc IGameGrid.render */
  public render(container: HTMLElement): void {
    insertStyles();
    this.refs.container = container;
    this.refs.cells = [];
    this.refs.rows = [];
    const fragment = this.renderGrid();
    this.refs.container.appendChild(fragment);
    this.setStateSync({ rendered: true });
    this.emit(gridEventsEnum.RENDERED);
    this.attachHandlers();
    this.setActiveCell(
      this.state.activeCoords![0],
      this.state.activeCoords![1],
      directionEnum.DOWN,
    );
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
    cellData.cellAttributes?.forEach((attr: string[]) => {
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

  /** @inheritDoc IGameGrid.setActiveCell */
  public setActiveCell(x: number, y: number, direction?: string): void {
    const boundaryCheckData = this.getValidXandY(x, y);

    x = boundaryCheckData.x;
    y = boundaryCheckData.y;

    const [currentX, currentY] = this.getState().activeCoords!;
    const prevCoords: [number, number] = [currentX, currentY];

    const hitsBlock = this.isBlockingCell(x, y);
    const wasAttached = this.isCollidingCell(currentX, currentY);
    const hitsCollide = this.isCollidingCell(x, y);

    this.setStateSync({
      activeCoords: hitsBlock ? this.state.activeCoords : [x, y],
      prevCoords: this.state.activeCoords,
      moves: this.createNewMovesArray(),
      currentDirection: direction,
    });

    if (hitsBlock) {
      this.emit(gridEventsEnum.MOVE_BLOCKED);
      this.options.callbacks?.onBlock?.(this, this.getState());
    }
    if (hitsCollide) {
      this.emit(gridEventsEnum.MOVE_COLLISION);
      this.options.callbacks?.onCollide?.(this, this.getState());
    }
    if (wasAttached) {
      this.emit(gridEventsEnum.MOVE_DETTACH);
      this.options.callbacks?.onDettach?.(this, this.getState());
    }

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
      deferredActiveSync = this.handleSlideZoomOnEdge(direction);
    }

    this.emit(gridEventsEnum.MOVE_LAND);
    this.options.callbacks?.onLand?.(this, this.getState());

    if (!hitsBlock) {
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

  /** @inheritDoc IGameGrid.getActiveCell */
  public getActiveCell(): ICell {
    return this.refs.cells[this.state.activeCoords![1]][this.state.activeCoords![0]];
  }

  /** @inheritDoc IGameGrid.getPreviousCell */
  public getPreviousCell(): ICell {
    const x = this.state.prevCoords![0];
    const y = this.state.prevCoords![1];
    return {
      ...this.refs.cells[y][x],
    };
  }

  /** @inheritDoc IGameGrid.getCell */
  public getCell(coords: readonly [number, number] | number[]): ICell {
    const x = coords[0];
    const y = coords[1];
    return this.matrix[y][x];
  }

  /** @inheritDoc IGameGrid.getAllCellsByType */
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

  /** @inheritDoc IGameGrid.moveUp */
  public moveUp(): void {
    this.options.callbacks?.onMove?.(this, this.getState());
    this.emit(gridEventsEnum.MOVE_UP);

    this.setActiveCell(
      this.state.activeCoords![0],
      this.state.activeCoords![1] - 1,
      directionEnum.UP,
    );
  }

  /** @inheritDoc IGameGrid.moveRight */
  public moveRight(): void {
    this.options.callbacks?.onMove?.(this, this.getState());
    this.emit(gridEventsEnum.MOVE_RIGHT);

    this.setActiveCell(
      this.state.activeCoords![0] + 1,
      this.state.activeCoords![1],
      directionEnum.RIGHT,
    );
  }

  /** @inheritDoc IGameGrid.moveDown */
  public moveDown(): void {
    this.options.callbacks?.onMove?.(this, this.getState());
    this.emit(gridEventsEnum.MOVE_DOWN);

    this.setActiveCell(
      this.state.activeCoords![0],
      this.state.activeCoords![1] + 1,
      directionEnum.DOWN,
    );
  }

  /** @inheritDoc IGameGrid.moveLeft */
  public moveLeft(): void {
    this.options.callbacks?.onMove?.(this, this.getState());
    this.emit(gridEventsEnum.MOVE_LEFT);

    this.setActiveCell(
      this.state.activeCoords![0] - 1,
      this.state.activeCoords![1],
      directionEnum.LEFT,
    );
  }

  /// MOVEMENT HELPERS
  private createNewMovesArray(): number[][] {
    const clonedMoves = [...this.getState().moves];
    clonedMoves.unshift(this.state.activeCoords);
    if (clonedMoves.length > this.options.rewindLimit!) {
      clonedMoves.shift();
    }
    return clonedMoves;
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
    try {
      if (this.getOptions().clickable) {
        if (event.target instanceof HTMLElement) {
          const cellEl = event.target.closest('[data-gamegrid-ref="cell"]');
          if (cellEl instanceof HTMLElement) {
            const coords = getCoordsFromElement(cellEl);
            if (coords) {
              this.setActiveCell(coords[0], coords[1]);
            } else {
              throw new Error('No cell found');
            }
          } else {
            throw new Error('No cell found');
          }
        }
      }
    } catch (e) {
      console.error(e);
      throw new Error('Error handling cell click. You possibly have missing attributes');
    }
  };

  /** @inheritDoc IGameGrid.getOptions */
  public getOptions(): IOptions {
    return this.options;
  }
  /** @inheritDoc IGameGrid.setOptions */
  public setOptions(newOptions: IOptions): void {
    this.options = { ...this.options, ...newOptions };
  }
  /** @inheritDoc IGameGrid.destroy */
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
    this.updateState({ rendered: false });
    this.emit(gridEventsEnum.DESTROYED);
  }

  /** @inheritDoc IGameGrid.setMatrix */
  public setMatrix(m: ICell[][]): void {
    this.matrix = m;
  }

  /** @inheritDoc IGameGrid.getMatrix */
  public getMatrix(): ICell[][] {
    return this.matrix;
  }

  /** @inheritDoc IGameGrid.getZoom */
  public getZoom(): IZoomBounds | null {
    return this.state.zoom;
  }

  /** @inheritDoc IGameGrid.setZoom */
  public setZoom(bounds: IZoomBounds, options?: IZoomOptions): void {
    const fromZoom = this.state.zoom;
    const normalized = normalizeZoomBounds(bounds, this.matrix);
    const animate = resolveAnimate(options, this.options.animateZoom);
    const activeCoords = this.getState().activeCoords!;
    const clamped = clampCoordsToZoom(activeCoords, normalized);
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

  /** @inheritDoc IGameGrid.clearZoom */
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

  /** @inheritDoc IGameGrid.getZoomAround */
  public getZoomAround(
    center: readonly [number, number] | number[],
    radiusX: number,
    radiusY?: number,
  ): IZoomBounds {
    return computeZoomAround(this.matrix, center, radiusX, radiusY);
  }

  /** @inheritDoc IGameGrid.getQuadrantZoom */
  public getQuadrantZoom(quadrant: ZoomQuadrant): IZoomBounds {
    return getQuadrantZoom(this.matrix, quadrant);
  }

  /** @inheritDoc IGameGrid.getFractionZoom */
  public getFractionZoom(divisions: number, tileX: number, tileY: number): IZoomBounds {
    return getFractionZoom(this.matrix, divisions, tileX, tileY);
  }

  /** @inheritDoc IGameGrid.zoomAround */
  public zoomAround(
    center: readonly [number, number] | number[],
    radiusX: number,
    radiusY?: number,
    options?: IZoomOptions,
  ): void {
    this.setZoom(this.getZoomAround(center, radiusX, radiusY), options);
  }

  /** @inheritDoc IGameGrid.zoomQuadrant */
  public zoomQuadrant(quadrant: ZoomQuadrant, options?: IZoomOptions): void {
    this.setZoom(this.getQuadrantZoom(quadrant), options);
  }

  /** @inheritDoc IGameGrid.zoomFraction */
  public zoomFraction(
    divisions: number,
    tileX: number,
    tileY: number,
    options?: IZoomOptions,
  ): void {
    this.setZoom(this.getFractionZoom(divisions, tileX, tileY), options);
  }

  /** @inheritDoc IGameGrid.getRegionAt */
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

  /** @inheritDoc IGameGrid.getActiveRegion */
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
