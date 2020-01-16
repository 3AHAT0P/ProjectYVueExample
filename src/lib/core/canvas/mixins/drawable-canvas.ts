import Point from '@/lib/core/utils/point';
import Tile from '@/lib/core/utils/tile';
import Cursor from '@/lib/core/utils/cursor';

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

    [_onMouseLeaveHandler]() {
      window.addEventListener('mouseup', this[_onMouseUpHandler], { passive: true });
    }

    [_onMouseEnterHandler]() {
      window.removeEventListener('mouseup', this[_onMouseUpHandler]);
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
      this._el.addEventListener('mouseenter', this[_onMouseEnterHandler], { passive: true });
      this._el.addEventListener('mouseleave', this[_onMouseLeaveHandler], { passive: true });
    }

    constructor(options = {}) {
      super(options);

      this[_onContextMenuHandler] = this[_onContextMenuHandler].bind(this);
      this[_onMouseDownHandler] = this[_onMouseDownHandler].bind(this);
      this[_onMouseMoveHandler] = this[_onMouseMoveHandler].bind(this);
      this[_onMouseUpHandler] = this[_onMouseUpHandler].bind(this);
      this[_onMouseEnterHandler] = this[_onMouseEnterHandler].bind(this);
      this[_onMouseLeaveHandler] = this[_onMouseLeaveHandler].bind(this);
    }

    async updateCurrentTiles(tiles: Map<string, Tile>) {
      super.updateCurrentTiles(tiles);

      await this._cursor.updateImageFromTilemap(tiles);
      this._cursor.showCursor();
    }

    async save() {
      const json: any = {
        tileHash: {},
        tileMapSize: {
          width: this.width,
          height: this.height,
        },
      };

      for (const [key, tile] of this._layers[ZERO_LAYER].entries()) {
        json.tileHash[key] = tile.meta;
      }

      return { meta: json };
    }

    async load({ meta: tilesMeta, img }: any) {
      console.log('DrawableCanvas::load - Called');
      const promises = [];
      for (const [key, tileMeta] of Object.entries<any>(tilesMeta)) {
        const x = tileMeta.sourceCoords.x * this._tileSize.x;
        const y = tileMeta.sourceCoords.y * this._tileSize.y;

        const source = {
          data: img,
          url: tileMeta.sourceSrc,
          tileSize: { ...this._tileSize },
        };

        promises.push(
          Tile.fromTileSet(source, { x, y }, { sourceCoords: tileMeta.sourceCoords, size: { ...this._tileSize } })
            .then((tile: Tile) => this._layers[ZERO_LAYER].set(key, tile)),
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
