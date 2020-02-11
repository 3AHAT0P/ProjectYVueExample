import InteractiveObject from '@/lib/core/InteractiveObject/InteractiveObject';

import { updateInheritanceSequance, checkInheritanceSequance, copyArray } from '@/lib/core/utils';

import Canvas, { CanvasOptions, isCanvas } from '../../Canvas';

import {
  buildLayers,
  Layer,
  GridLayer,
  LAYER_INDEX,
  BACKGROUND_LAYER,
  ZERO_LAYER,
  FOREGROUND_LAYER,
  SYSTEM_UI_LAYER,
} from './buildLayers';

export type TileableCanvasOptions = CanvasOptions & { cellSize?: { x: number, y: number }; };

export interface ITileableCanvas {
  readonly sizeInTiles: { x: number, y: number };
  readonly tiles: Map<string, IRenderedObject>;
  readonly layers: Hash<Layer>;
  readonly cellSize: { x: number, y: number };
  readonly normalizedCellSize: { x: number, y: number };
  invalidateCache(level: LAYER_INDEX | 'ALL'): void;
  updateVisibleLayers(levels: LAYER_INDEX[]): void;
  clearLayer(level: LAYER_INDEX | 'ALL'): void;
  updateCurrentTiles(tiles: Map<string, IRenderedObject>): Promise<void>;
  resize(width: number, height: number): void;
  updateTilesCount(width: number, height: number): void;
}

export interface ITileableCanvasProtected {
  _getTile(x: number, y: number, z?: LAYER_INDEX): IRenderedObject;
  _updateTileByCoord(x: number, y: number, z: LAYER_INDEX, tile: IRenderedObject): void;
  _clearLayer(level: '-1' | '0' | '1' | '2' | 'ALL'): void;
  _drawLayers(): void;
  _appendInteractiveObject(iObject: InteractiveObject): void;
  _render(time: number, clearRender?: boolean): void;
  _transformEventCoordsToGridCoords(eventX: number, eventY: number): [number, number];
  _updateMultiplier(multiplier: number): void;
  _applyOptions(options: TileableCanvasOptions): boolean;
}

const CLASS_NAME = Symbol.for('TileableCanvas');

export const isTileable = (Class: any) => checkInheritanceSequance(Class, CLASS_NAME);

const LAYER_INDICES: LAYER_INDEX[] = [BACKGROUND_LAYER, ZERO_LAYER, FOREGROUND_LAYER, SYSTEM_UI_LAYER];

const TileableCanvasMixin = <T = any>(BaseClass: Constructor = Canvas): Constructor<ITileableCanvas & T> => {
  if (isTileable(BaseClass)) return BaseClass;
  if (!isCanvas(BaseClass)) throw new Error('BaseClass isn\'t prototype of Canvas!');

  class TileableCanvas extends BaseClass implements ITileableCanvas {
    private _tiles: Map<string, IRenderedObject> = null;
    private _cellSize = {
      x: 16,
      y: 16,
    };

    private _visibleLayersChanged: boolean = false;
    private _visibleLayers: LAYER_INDEX[] = copyArray(LAYER_INDICES);

    private _layers: Hash<Layer> = buildLayers(LAYER_INDICES);
    private _gridLayer = new GridLayer();

    private _interactiveObjects: InteractiveObject[] = [];

    private _columnsNumber = 0;
    private _rowsNumber = 0;

    public get sizeInTiles() {
      return {
        x: this._columnsNumber,
        y: this._rowsNumber,
      };
    }

    // current
    public get tiles() { return this._tiles; }
    public get layers() { return this._layers; }
    public get cellSize() { return this._cellSize; }
    public get normalizedCellSize() {
      return {
        x: this.normalizedWidth / this._columnsNumber,
        y: this.normalizedHeight / this._rowsNumber,
      };
    }

    private _calcGrid() {
      this._columnsNumber = Math.trunc(this.width / this.cellSize.x);
      this._rowsNumber = Math.trunc(this.height / this.cellSize.y);
    }

    private _drawGrid() {
      const renderedObject = this._gridLayer.getRenderedObject();
      this._ctx.drawImage(
        renderedObject.source,
        renderedObject.sourceBoundingRect.x,
        renderedObject.sourceBoundingRect.y,
        renderedObject.sourceBoundingRect.width,
        renderedObject.sourceBoundingRect.height,
        0,
        0,
        this.width,
        this.height,
      );
    }

    private _resizeLayers() {
      for (const layerIndex of LAYER_INDICES) {
        this._layers[layerIndex].resize(this.normalizedWidth, this.normalizedHeight);
      }
      this._gridLayer.resize(this.normalizedWidth, this.normalizedHeight, this._columnsNumber, this._rowsNumber);
    }

    protected _getTile(x: number, y: number, z: LAYER_INDEX = ZERO_LAYER) {
      return this._layers[z].take(x, y);
    }

    protected _updateTileByCoord(x: number, y: number, z: LAYER_INDEX = ZERO_LAYER, tile: IRenderedObject) {
      const layer = this._layers[z];
      if (tile != null && layer.take(x, y) !== tile) layer.add(x, y, tile);
      else if (layer.exist(x, y)) layer.remove(x, y);
    }

    protected _clearLayer(level: LAYER_INDEX | 'ALL') {
      if (level === 'ALL' || level === ZERO_LAYER) this._interactiveObjects = [];
      if (level === 'ALL') {
        for (const layerIndex of LAYER_INDICES) this._layers[layerIndex].clear();
      } else this._layers[level].clear();
    }

    protected _drawLayers() {
      for (const layerIndex of this._visibleLayers) {
        const renderedObject = this._layers[layerIndex].getRenderedObject();
        this._ctx.drawImage(
          renderedObject.source,
          renderedObject.sourceBoundingRect.x,
          renderedObject.sourceBoundingRect.y,
          renderedObject.sourceBoundingRect.width,
          renderedObject.sourceBoundingRect.height,
          0,
          0,
          this.width,
          this.height,
        );
      }
    }

    protected _appendInteractiveObject(iObject: InteractiveObject) {
      this._interactiveObjects.push(iObject);
    }

    // @TODO That time might be used for checking time between renders
    protected _render(time: number, clearRender = false) {
      // this._applyImageSmoothing();
      if (!this._visibleLayersChanged) {
        let reallyNeedRender = false;
        for (const layerIndex of this._visibleLayers) {
          if (this._layers[layerIndex].isDirty) {
            reallyNeedRender = true;
            break;
          }
        }
        if (!reallyNeedRender) return;
      }
      this.clear();
      this._drawLayers();
      this.emit(':render', { ctx: this.ctx });
      if (!clearRender) this._drawGrid();
    }

    protected _transformEventCoordsToGridCoords(eventX: number, eventY: number): [number, number] {
      return [Math.trunc(eventX / this._cellSize.x), Math.trunc(eventY / this._cellSize.y)];
    }

    protected _updateMultiplier(multiplier: number) {
      this._cellSize.x *= multiplier;
      this._cellSize.y *= multiplier;
      // @ts-ignore
      if (super._resize != null) super._updateMultiplier(multiplier);
      this._renderInNextFrame();
    }

    protected _applyOptions(options: TileableCanvasOptions): boolean {
      if (!super._applyOptions(options)) return false;

      if (options.cellSize != null && options.cellSize.x != null) this._cellSize.x = options.cellSize.x;
      if (options.cellSize != null && options.cellSize.y != null) this._cellSize.y = options.cellSize.y;

      return true;
    }

    public async init() {
      this._calcGrid();

      // prepare Layers
      this._resizeLayers();

      await super.init();
    }

    public invalidateCache(level: LAYER_INDEX | 'ALL') {
      if (level === 'ALL') {
        for (const layerIndex of LAYER_INDICES) {
          this._layers[layerIndex].invalidateCache();
        }
      } else this._layers[level].invalidateCache();
    }

    public updateVisibleLayers(levels: LAYER_INDEX[]) {
      this._visibleLayers = <LAYER_INDEX[]>[...levels, SYSTEM_UI_LAYER].sort();
      this._visibleLayersChanged = true;
      this._renderInNextFrame();
    }

    public clearLayer(level: LAYER_INDEX | 'ALL') {
      this._clearLayer(level);
      this._renderInNextFrame();
    }

    public async updateCurrentTiles(tiles: Map<string, IRenderedObject>) {
      this._tiles = tiles;
      this._renderInNextFrame();
    }

    public resize(width: number, height: number) {
      super.resize(width, height);
      this._calcGrid();
      this._resizeLayers();
      this._renderInNextFrame();
    }

    public updateTilesCount(width: number, height: number) {
      this.resize(width * this.cellSize.x, height * this.cellSize.y);
    }
  }

  updateInheritanceSequance(TileableCanvas, BaseClass, CLASS_NAME);

  return TileableCanvas as any;
};

export default TileableCanvasMixin;

export const TileableCanvas = TileableCanvasMixin<Canvas>();
export type TileableCanvas = typeof TileableCanvas;
