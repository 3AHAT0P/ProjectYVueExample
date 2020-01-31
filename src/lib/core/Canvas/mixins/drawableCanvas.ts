import Point from '@/lib/core/utils/classes/Point';
import Tile from '@/lib/core/utils/classes/Tile';
import Cursor from '@/lib/core/utils/classes/Cursor';
import InteractiveObject from '@/lib/core/utils/classes/InteractiveObject';

import GameObject from '@/lib/core/GameObject';

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

    _createInteractiveObject(x: number, y: number, gameObject: GameObject) {
      const sizeInTiles = this.sizeInTiles;
      const boundingRect = gameObject.sourceBoundingRect;
      let tilesByX = 1;
      let tilesByY = 1;
      if (boundingRect.width > this.normalizedTileSize.x) {
        tilesByX = Math.ceil(boundingRect.width / this.normalizedTileSize.x);
      }
      if (boundingRect.height > this.normalizedTileSize.y) {
        tilesByY = Math.ceil(boundingRect.height / this.normalizedTileSize.y);
      }

      const coords: Point[] = [];

      for (let _y = 0; _y < tilesByY; _y += 1) {
        for (let _x = 0; _x < tilesByX; _x += 1) {
          const resultX = x + _x;
          const resultY = y + _y;
          if ((resultX >= 0 && resultX < sizeInTiles.x) && (resultY >= 0 && resultY < sizeInTiles.y)) {
            coords.push(new Point(resultX, resultY));
          }
        }
      }
      const iObject = new InteractiveObject({ gameObject, coordTiles: coords });
      this._appendInteractiveObject(iObject);
    }

    _updateTilePlace(x: number, y: number, z: LAYER_INDEX = ZERO_LAYER) {
      if (this.tiles == null) return;

      if (this._drawType === DRAW_STATE_ENAM.ERASE) this._updateTileByCoord(x, y, z, null);
      else if (this._drawType === DRAW_STATE_ENAM.DRAW) {
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
        uniqGameObjects: {},
        tileHash: {},
        tileMapSize: {
          width: this.width / sizeMultiplier,
          height: this.height / sizeMultiplier,
        },
        version: '0.6.0',
      };

      // @TODO: Types!

      for (const [key, tile] of this._layers[BACKGROUND_LAYER].entries()) {
        if (json.uniqGameObjects[tile.id] == null) json.uniqGameObjects[tile.id] = (tile as any).meta;
        json.tileHash[`${BACKGROUND_LAYER}>${key}`] = tile.id;
      }

      for (const [key, tile] of this._layers[ZERO_LAYER].entries()) {
        if (json.uniqGameObjects[tile.id] == null) json.uniqGameObjects[tile.id] = (tile as any).meta;
        json.tileHash[`${ZERO_LAYER}>${key}`] = tile.id;
      }

      for (const [key, tile] of this._layers[FOREGROUND_LAYER].entries()) {
        if (json.uniqGameObjects[tile.id] == null) json.uniqGameObjects[tile.id] = (tile as any).meta;
        json.tileHash[`${FOREGROUND_LAYER}>${key}`] = tile.id;
      }

      return { meta: json };
    }

    async load({ meta, imageHash }: any) {
      if (meta.version !== '0.6.0') throw new Error('Metadata file version mismatch!');

      const { uniqGameObjects, tileHash: gridCells } = meta;

      const renderedObjects: Hash<IRenderedObject> = {};
      const promises = [];

      for (const [id, _meta] of Object.entries<any>(uniqGameObjects)) {
        if (_meta.hitBoxes != null) {
          promises.push(GameObject.fromMeta(_meta).then((gameObject) => { renderedObjects[id] = gameObject; }));
        } else renderedObjects[id] = Tile.fromMeta(_meta, imageHash[_meta.sourceURL]);
      }

      await Promise.all(promises);

      for (const [key, id] of Object.entries<any>(gridCells)) {
        const [level, place] = key.split('>');
        const renderedObject = renderedObjects[id];
        this._layers[level].set(place, renderedObject);
        if (renderedObject instanceof GameObject) {
          const [x, y] = Point.fromReverseString(place).toArray();
          this._createInteractiveObject(x, y, renderedObject);
        }
      }

      this.invalidateCache('ALL');
    }
  }

  (DrawableCanvas as any)._metaClassNames = [...(BaseClass._metaClassNames || []), CLASS_NAME];

  return DrawableCanvas;
};

export default DrawableCanvasMixin;

export const DrawableCanvas = DrawableCanvasMixin();
