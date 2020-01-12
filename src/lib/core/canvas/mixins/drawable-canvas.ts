import buildEvent from '@/utils/build-event';
import Point from '@/utils/point';
import Cursor from '@/utils/cursor';

import CustomCanvas from '../canvas';

import TileableCanvasMixin, {
  TileableCanvas,
  BACKGROUND_LAYER,
  ZERO_LAYER,
  FOREGROUND_LAYER,
  LAYER_INDEX,
} from './tileable-canvas';

const _onMouseEnterHandler = Symbol('_onMouseEnterHandler');
const _onMouseLeaveHandler = Symbol('_onMouseLeaveHandler');
const _onMouseDownHandler = Symbol('_onMouseDownHandler');
const _onMouseMoveHandler = Symbol('_onMouseMoveHandler');
const _onMouseUpHandler = Symbol('_onMouseUpHandler');
const _onContextMenuHandler = Symbol('_onContextMenuHandler');

const CLASS_NAME = Symbol.for('DrawableCanvas');

const DRAW_STATE_ENAM = {
  ERASE: 0,
  DRAW: 1,
};

const DrawableCanvasMixin = (BaseClass: typeof TileableCanvas = TileableCanvas) => {
  if (!((BaseClass as any) === CustomCanvas || CustomCanvas.isPrototypeOf(BaseClass))) {
    throw new Error('BaseClass isn\'t prototype of CustomCanvas!');
  }
  if (!(Array.isArray(BaseClass._metaClassNames) && BaseClass._metaClassNames.includes(Symbol.for('TileableCanvas')))) {
    // eslint-disable-next-line no-param-reassign
    BaseClass = TileableCanvasMixin(BaseClass);
  }

  class DrawableCanvas extends BaseClass {
    _drawState = false;
    _drawType = DRAW_STATE_ENAM.DRAW;

    _cursor = new Cursor(this._el, { offset: { x: 8, y: 8 } });

    [_onMouseDownHandler](event: MouseEvent) {
      // @TODO improve it!!!
      if (event.metaKey || event.ctrlKey) return;
      this._startDraw(event);
      this._updateTilePlace(...this._transformEventCoordsToGridCoords(event.offsetX, event.offsetY));
      this._renderInNextFrame();
    }

    [_onMouseMoveHandler](event: MouseEvent) {
      if (this._drawState) {
        this._updateTilePlace(...this._transformEventCoordsToGridCoords(event.offsetX, event.offsetY));
        this._renderInNextFrame();
      }
    }

    [_onMouseUpHandler]() {
      this._drawState = false;
      this._el.removeEventListener('mousemove', this[_onMouseMoveHandler]);
    }

    [_onContextMenuHandler](event: MouseEvent) {
      if (!event.metaKey) event.preventDefault();
    }

    _startDraw(event: MouseEvent) {
      if (this.tiles == null) return;

      this._drawState = true;
      if (event.button === 0) this._drawType = DRAW_STATE_ENAM.DRAW;
      if (event.button === 2) this._drawType = DRAW_STATE_ENAM.ERASE;
      this._el.addEventListener('mousemove', this[_onMouseMoveHandler], { passive: true });
    }

    _updateTilePlace(x: number, y: number, z: LAYER_INDEX = ZERO_LAYER) {
      if (this.tiles == null) return;

      if (this._drawType === DRAW_STATE_ENAM.ERASE) this._updateTileByCoord(x, y, z, null);
      else if (this._drawType === DRAW_STATE_ENAM.DRAW) {
        for (const [place, tile] of this.tiles.entries()) {
          const [_y, _x] = Point.fromString(place).toArray();
          this._updateTileByCoord(x + _x, y + _y, z, tile);
        }
      }
    }

    async _initListeners() {
      await super._initListeners();

      this._el.addEventListener('contextmenu', this[_onContextMenuHandler]);
      this._el.addEventListener('mousedown', this[_onMouseDownHandler], { passive: true });
      this._el.addEventListener('mouseup', this[_onMouseUpHandler], { passive: true });
    }

    constructor(options = {}) {
      super(options);

      this[_onContextMenuHandler] = this[_onContextMenuHandler].bind(this);
      this[_onMouseDownHandler] = this[_onMouseDownHandler].bind(this);
      this[_onMouseMoveHandler] = this[_onMouseMoveHandler].bind(this);
      this[_onMouseUpHandler] = this[_onMouseUpHandler].bind(this);
    }

    async updateCurrentTiles(tiles: Map<string, ImageBitmap>) {
      super.updateCurrentTiles(tiles);
      if (this.tiles.size === 1) {
        await this._cursor.updateImageFromBitmap(this.tiles.get(new Point(0, 0).toString()));
        this._cursor.showCursor();
      }
    }

    async save() {
      const a = document.createElement('a');
      a.style.display = 'none';
      document.body.appendChild(a);

      this._render(null, true);

      const img = await new Promise((resolve) => this._el.toBlob(resolve, 'image/png'));
      a.href = URL.createObjectURL(img);
      a.download = 'tilemap.png';
      a.click();
      URL.revokeObjectURL(a.href);

      this._render(null, false);

      const json: Hash = {};

      for (const [key, tile] of this._layers[ZERO_LAYER].entries()) {
        json[key] = { };
      }
      const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
      a.href = URL.createObjectURL(blob);
      a.download = 'tilemap.json';
      a.click();
      URL.revokeObjectURL(a.href);

      a.remove();
    }

    async load({ meta: tilesMeta, img }: any) {
      const promises = [];
      for (const [key, tileMeta] of Object.entries(tilesMeta)) {
        const [y, x] = Point.fromString(key).toArray();
        promises.push(
          createImageBitmap(img, x * this._tileSize.x, y * this._tileSize.y, this._tileSize.x, this._tileSize.y)
            .then((tile) => this._layers[ZERO_LAYER].set(key, tile)),
        );
      }
      await Promise.all(promises);
    }
  }

  (DrawableCanvas as any)._metaClassNames = [...(BaseClass._metaClassNames || []), CLASS_NAME];

  return DrawableCanvas;
};

export default DrawableCanvasMixin;

export const DrawableCanvas = DrawableCanvasMixin();
