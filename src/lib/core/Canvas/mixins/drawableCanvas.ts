import Point from '@/lib/core/utils/classes/Point';
import Cursor from '@/lib/core/utils/classes/Cursor';

import GameObject from '@/lib/core/RenderedObject/GameObject/GameObject';
import Tile from '@/lib/core/RenderedObject/Tile';

import { updateInheritanceSequance, checkInheritanceSequance } from '@/lib/core/utils';

import { TileableCanvas, isTileable, TileableCanvasOptions } from './tileableCanvas/tileableCanvas';

import {
  LAYER_INDEX,
  ZERO_LAYER,
} from './tileableCanvas/buildLayers';

const _onMouseEnterHandler = Symbol('_onMouseEnterHandler');
const _onMouseLeaveHandler = Symbol('_onMouseLeaveHandler');
const _onMouseDownHandler = Symbol('_onMouseDownHandler');
const _onMouseMoveHandler = Symbol('_onMouseMoveHandler');
const _onMouseUpHandler = Symbol('_onMouseUpHandler');
const _onContextMenuHandler = Symbol('_onContextMenuHandler');

const CLASS_NAME = Symbol.for('DrawableCanvas');
export const isDrawable = (Class: any) => checkInheritanceSequance(Class, CLASS_NAME);

export type DrawableCanvasOptions = TileableCanvasOptions & { };

export interface IDrawableCanvas {
  currentLayerIndex: LAYER_INDEX;

  updateCurrentLayerIndex(level: LAYER_INDEX): Promise<void>;
  updateCurrentTiles(tiles: Map<string, Tile>): Promise<void>;
}

export interface IDrawableCanvasProtected {
  _initListeners(): Promise<void>;
}

const DRAW_STATE_ENUM = {
  ERASE: 0,
  DRAW: 1,
};

const DrawableCanvasMixin = <T = any>(BaseClass: Constructor = TileableCanvas): Constructor<IDrawableCanvas & T> => {
  if (isDrawable(BaseClass)) return BaseClass;

  if (!isTileable(BaseClass)) throw new Error('BaseClass isn\'t prototype of TileableCanvas!');

  class DrawableCanvas extends BaseClass implements IDrawableCanvas {
    private _drawState = false;
    private _drawType = DRAW_STATE_ENUM.DRAW;
    private _cursor = new Cursor(this.canvas, { offset: { x: 0, y: 0 } });
    private _currentLayerIndex: LAYER_INDEX = ZERO_LAYER;

    public get currentLayerIndex() { return this._currentLayerIndex; }

    private [_onMouseDownHandler](event: MouseEvent) {
      // @TODO improve it!!!
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      this._startDraw(event);
      const [x, y] = this._transformEventCoordsToGridCoords(event.offsetX, event.offsetY);
      this._updateTilePlace(x, y, this._currentLayerIndex);
      this._renderInNextFrame();
    }

    private [_onMouseMoveHandler](event: MouseEvent) {
      if (this._drawState) {
        const [x, y] = this._transformEventCoordsToGridCoords(event.offsetX, event.offsetY);
        this._updateTilePlace(x, y, this._currentLayerIndex);
        this._renderInNextFrame();
      }
    }

    private [_onMouseUpHandler]() {
      this._drawState = false;
      this.canvas.removeEventListener('mousemove', this[_onMouseMoveHandler]);
    }

    private [_onMouseLeaveHandler]() {
      window.addEventListener('mouseup', this[_onMouseUpHandler], { passive: true });
    }

    private [_onMouseEnterHandler]() {
      window.removeEventListener('mouseup', this[_onMouseUpHandler]);
    }

    private [_onContextMenuHandler](event: MouseEvent) {
      if (!event.metaKey) event.preventDefault();
    }

    private _startDraw(event: MouseEvent) {
      if (this.tiles == null) return;

      this._drawState = true;
      if (event.button === 0) this._drawType = DRAW_STATE_ENUM.DRAW;
      if (event.button === 2) this._drawType = DRAW_STATE_ENUM.ERASE;
      this.canvas.addEventListener('mousemove', this[_onMouseMoveHandler], { passive: true });
    }

    private _updateTilePlace(x: number, y: number, z: LAYER_INDEX = ZERO_LAYER) {
      if (this.tiles == null) return;

      if (this._drawType === DRAW_STATE_ENUM.ERASE) this._updateTileByCoord(x, y, z, null);
      else if (this._drawType === DRAW_STATE_ENUM.DRAW) {
        const sizeInTiles = this.sizeInTiles;
        if (this.tiles.size === 1) {
          const renderedObject = this.tiles.get(new Point(0, 0).toReverseString());
          this._updateTileByCoord(x, y, z, renderedObject);

          if (renderedObject instanceof GameObject) this._createInteractiveObject(x, y, renderedObject);
        } else {
          for (const [place, renderedObject] of this.tiles.entries()) {
            const [resultX, resultY] = Point.fromReverseString(place).add(x, y).toArray();
            if ((resultX >= 0 && resultX < sizeInTiles.x) && (resultY >= 0 && resultY < sizeInTiles.y)) {
              this._updateTileByCoord(resultX, resultY, z, renderedObject);
            }
          }
        }
      }
    }

    protected async _initListeners() {
      await super._initListeners();

      this.canvas.addEventListener('contextmenu', this[_onContextMenuHandler]);
      this.canvas.addEventListener('mousedown', this[_onMouseDownHandler], { passive: true });
      this.canvas.addEventListener('mouseup', this[_onMouseUpHandler], { passive: true });
      this.canvas.addEventListener('mouseenter', this[_onMouseEnterHandler], { passive: true });
      this.canvas.addEventListener('mouseleave', this[_onMouseLeaveHandler], { passive: true });
    }

    constructor(options: DrawableCanvasOptions) {
      super(options);

      this[_onContextMenuHandler] = this[_onContextMenuHandler].bind(this);
      this[_onMouseDownHandler] = this[_onMouseDownHandler].bind(this);
      this[_onMouseMoveHandler] = this[_onMouseMoveHandler].bind(this);
      this[_onMouseUpHandler] = this[_onMouseUpHandler].bind(this);
      this[_onMouseEnterHandler] = this[_onMouseEnterHandler].bind(this);
      this[_onMouseLeaveHandler] = this[_onMouseLeaveHandler].bind(this);
    }

    public async updateCurrentLayerIndex(level: LAYER_INDEX) {
      this._currentLayerIndex = level;
    }

    public async updateCurrentTiles(tiles: Map<string, Tile>) {
      super.updateCurrentTiles(tiles);

      await this._cursor.updateImageFromTilemap(tiles);
      this._cursor.showCursor();
    }
  }

  updateInheritanceSequance(TileableCanvas, BaseClass, CLASS_NAME);

  return DrawableCanvas as any;
};

export default DrawableCanvasMixin;

export const DrawableCanvas = DrawableCanvasMixin<TileableCanvas>();
