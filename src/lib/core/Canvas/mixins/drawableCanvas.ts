import Point from '@/lib/core/utils/classes/Point';
import Tile from '@/lib/core/utils/classes/Tile';
import Cursor from '@/lib/core/utils/classes/Cursor';

import Canvas from '..';

import TileableCanvasMixin, {
  TileableCanvas,
  BACKGROUND_LAYER,
  ZERO_LAYER,
  FOREGROUND_LAYER,
  LAYER_INDEX,
} from './tileableCanvas';

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
  if (!((BaseClass as any) === Canvas || Canvas.isPrototypeOf(BaseClass))) {
    throw new Error('BaseClass isn\'t prototype of Canvas!');
  }
  if (!(Array.isArray(BaseClass._metaClassNames) && BaseClass._metaClassNames.includes(Symbol.for('TileableCanvas')))) {
    // eslint-disable-next-line no-param-reassign
    BaseClass = TileableCanvasMixin(BaseClass);
  }

  class DrawableCanvas extends BaseClass {
    _drawState = false;
    _drawType = DRAW_STATE_ENAM.DRAW;

    private _currentLayerIndex: LAYER_INDEX = ZERO_LAYER;
    public get currentLayerIndex() { return this._currentLayerIndex; }

    _cursor = new Cursor(this._el, { offset: { x: 0, y: 0 } });

    [_onMouseDownHandler](event: MouseEvent) {
      // @TODO improve it!!!
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      this._startDraw(event);
      const [x, y] = this._transformEventCoordsToGridCoords(event.offsetX, event.offsetY);
      this._updateTilePlace(x, y, this._currentLayerIndex);
      this._renderInNextFrame();
    }

    [_onMouseMoveHandler](event: MouseEvent) {
      if (this._drawState) {
        const [x, y] = this._transformEventCoordsToGridCoords(event.offsetX, event.offsetY);
        this._updateTilePlace(x, y, this._currentLayerIndex);
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
          const resultX = x + _x;
          const resultY = y + _y;
          if ((resultX >= 0 && resultX < this._columnsNumber) && (resultY >= 0 && resultY < this._rowsNumber)) {
            this._updateTileByCoord(resultX, resultY, z, tile);
          }
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

    async updateCurrentLayerIndex(level: LAYER_INDEX) {
      this._currentLayerIndex = level;
    }

    async updateCurrentTiles(tiles: Map<string, Tile>) {
      super.updateCurrentTiles(tiles);

      await this._cursor.updateImageFromTilemap(tiles);
      this._cursor.showCursor();
    }

    async save() {
      // @ts-ignore
      const sizeMultiplier = this.sizeMultiplier || 1;

      const json: any = {
        uniqTiles: {},
        tileHash: {},
        tileMapSize: {
          width: this.width / sizeMultiplier,
          height: this.height / sizeMultiplier,
        },
        version: '0.4.1',
      };

      for (const [key, tile] of this._layers[BACKGROUND_LAYER].entries()) {
        if (json.uniqTiles[tile.id] == null) json.uniqTiles[tile.id] = tile.meta;
        json.tileHash[`${BACKGROUND_LAYER}>${key}`] = tile.id;
      }

      for (const [key, tile] of this._layers[ZERO_LAYER].entries()) {
        if (json.uniqTiles[tile.id] == null) json.uniqTiles[tile.id] = tile.meta;
        json.tileHash[`${ZERO_LAYER}>${key}`] = tile.id;
      }

      for (const [key, tile] of this._layers[FOREGROUND_LAYER].entries()) {
        if (json.uniqTiles[tile.id] == null) json.uniqTiles[tile.id] = tile.meta;
        json.tileHash[`${FOREGROUND_LAYER}>${key}`] = tile.id;
      }

      return { meta: json };
    }

    async load({ meta, imageHash }: any) {
      if (meta.version !== '0.4.1') throw new Error('Metadata file version mismatch!');

      const { uniqTiles, tileHash: gridCells } = meta;

      const tiles: Hash<Tile> = {};

      for (const [id, tileMeta] of Object.entries<any>(uniqTiles)) {
        tileMeta.source.data = imageHash[tileMeta.source.url];

        tiles[id] = Tile.fromTileMeta(tileMeta, this._tileSize);
      }

      for (const [key, tileId] of Object.entries<any>(gridCells)) {
        const [level, place] = key.split('>');
        this._layers[level].set(place, tiles[tileId]);
      }

      this.invalidateCache('ALL');
    }
  }

  (DrawableCanvas as any)._metaClassNames = [...(BaseClass._metaClassNames || []), CLASS_NAME];

  return DrawableCanvas;
};

export default DrawableCanvasMixin;

export const DrawableCanvas = DrawableCanvasMixin();
