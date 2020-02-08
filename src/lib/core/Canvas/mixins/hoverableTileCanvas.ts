import Tile from '@/lib/core/RenderedObject/Tile';

import { updateInheritanceSequance, checkInheritanceSequance } from '@/lib/core/utils';

import { TileableCanvasOptions, TileableCanvas, isTileable } from './tileableCanvas/tileableCanvas';
import { SYSTEM_UI_LAYER } from './tileableCanvas/buildLayers';

export type HoverableTileCanvasOptions = TileableCanvasOptions;

interface IHoverableTileCanvas {

}

const _onMouseMoveHandler = Symbol('_onMouseMoveHandler');
const _onMouseOutHandler = Symbol('_onMouseOutHandler');

const CLASS_NAME = Symbol.for('HoverableTileCanvas');

export const isHoverable = (Class: any) => checkInheritanceSequance(Class, CLASS_NAME);

// eslint-disable-next-line max-len
const HoverableTileCanvasMixin = <T = any>(BaseClass: Constructor = TileableCanvas): Constructor<IHoverableTileCanvas & T> => {
  if (isHoverable(BaseClass)) return BaseClass;

  if (!isTileable(BaseClass)) throw new Error('BaseClass isn\'t prototype of TileableCanvas!');

  class HoverableTileCanvas extends BaseClass {
    private _hoverTile: IRenderedObject = null;

    private [_onMouseMoveHandler](event: MouseEvent) {
      const [x, y] = this._transformEventCoordsToGridCoords(event.offsetX, event.offsetY);
      this._hoverTilePlace(x, y);
      this._renderInNextFrame();
    }

    private [_onMouseOutHandler](event: MouseEvent) {
      this._hoverTilePlace(-1, -1);
      this._renderInNextFrame();
    }

    private async _prepareHoverTileMask() {
      const canvas = document.createElement('canvas');
      Reflect.set(canvas.style, 'image-rendering', 'pixelated');
      canvas.width = this.cellSize.x;
      canvas.height = this.cellSize.y;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = 'hsla(0, 0%, 0%, .1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const sourceURL = 'HOVER_TILE_SOURCE';
      const source = canvas;
      const sourceBoundingRect = {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
      };

      this._hoverTile = new Tile({ source, sourceURL, sourceBoundingRect });
    }

    private _hoverTilePlace(x: number, y: number) {
      const layer = this._layers[SYSTEM_UI_LAYER];
      for (const [key, cell] of layer.entries()) {
        if (cell != null) {
          const [_x, _y] = layer.parseKey(key);
          if (x === _x && y === _y) return;

          this._updateTileByCoord(_x, _y, SYSTEM_UI_LAYER, null);
        }
      }
      this._updateTileByCoord(x, y, SYSTEM_UI_LAYER, this._hoverTile);
    }

    protected async _initListeners() {
      await super._initListeners();

      this.canvas.addEventListener('mousemove', this[_onMouseMoveHandler], { passive: true });
      this.canvas.addEventListener('mouseout', this[_onMouseOutHandler], { passive: true });
    }

    constructor(options: HoverableTileCanvasOptions) {
      super(options);

      this[_onMouseMoveHandler] = this[_onMouseMoveHandler].bind(this);
      this[_onMouseOutHandler] = this[_onMouseOutHandler].bind(this);
    }

    public async init() {
      await this._prepareHoverTileMask();
      await super.init();
    }
  }

  updateInheritanceSequance(HoverableTileCanvas, BaseClass, CLASS_NAME);

  return HoverableTileCanvas as any;
};

export default HoverableTileCanvasMixin;

export const HoverableTileCanvas = HoverableTileCanvasMixin<TileableCanvas>();
