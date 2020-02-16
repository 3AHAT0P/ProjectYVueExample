import Point from '@/lib/core/utils/classes/Point';
import InteractiveObject from '@/lib/core/InteractiveObject/InteractiveObject';

import GameObject from '@/lib/core/RenderedObject/GameObject/GameObject';
import Tile from '@/lib/core/RenderedObject/Tile';

import { updateInheritanceSequance, checkInheritanceSequance } from '@/lib/core/utils';

import { TileableCanvas, isTileable, TileableCanvasOptions } from './tileableCanvas/tileableCanvas';

import {
  BACKGROUND_LAYER,
  ZERO_LAYER,
  FOREGROUND_LAYER,
} from './tileableCanvas/constants';

const CLASS_NAME = Symbol.for('SavableCanvas');
export const isSavable = (Class: any) => checkInheritanceSequance(Class, CLASS_NAME);

export type SavableCanvasOptions = TileableCanvasOptions & { };

export interface ISavableCanvas {
  save(): Promise<{ meta: any; }>;
  load({ meta, imageHash }: any): Promise<void>;
}

export interface ISavableCanvasProtected {

}

const SavableCanvasMixin = <T = any>(BaseClass: Constructor = TileableCanvas): Constructor<ISavableCanvas & T> => {
  if (isSavable(BaseClass)) return BaseClass;

  if (!isTileable(BaseClass)) throw new Error('BaseClass isn\'t prototype of TileableCanvas!');

  class SavableCanvas extends BaseClass {
    private _createInteractiveObject(x: number, y: number, gameObject: GameObject) {
      const sizeInTiles = this.sizeInTiles;
      const boundingRect = gameObject.sourceBoundingRect;
      let tilesByX = 1;
      let tilesByY = 1;
      if (boundingRect.width > this.normalizedCellSize.x) {
        tilesByX = Math.ceil(boundingRect.width / this.normalizedCellSize.x);
      }
      if (boundingRect.height > this.normalizedCellSize.y) {
        tilesByY = Math.ceil(boundingRect.height / this.normalizedCellSize.y);
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

    public async save() {
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

      const layers = this.layers;

      for (const [key, tile] of layers[BACKGROUND_LAYER].entries()) {
        if (json.uniqGameObjects[tile.id] == null) json.uniqGameObjects[tile.id] = (tile as any).meta;
        json.tileHash[`${BACKGROUND_LAYER}>${key}`] = tile.id;
      }

      for (const [key, tile] of layers[ZERO_LAYER].entries()) {
        if (json.uniqGameObjects[tile.id] == null) json.uniqGameObjects[tile.id] = (tile as any).meta;
        json.tileHash[`${ZERO_LAYER}>${key}`] = tile.id;
      }

      for (const [key, tile] of layers[FOREGROUND_LAYER].entries()) {
        if (json.uniqGameObjects[tile.id] == null) json.uniqGameObjects[tile.id] = (tile as any).meta;
        json.tileHash[`${FOREGROUND_LAYER}>${key}`] = tile.id;
      }

      return { meta: json };
    }

    public async load({ meta, imageHash }: any) {
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

      const layers = this.layers;

      for (const [key, id] of Object.entries<any>(gridCells)) {
        const [level, place] = key.split('>');
        const renderedObject = renderedObjects[id];
        layers[level].set(place, renderedObject);
        if (renderedObject instanceof GameObject) {
          const [x, y] = Point.fromReverseString(place).toArray();
          this._createInteractiveObject(x, y, renderedObject);
        }
      }
    }
  }

  updateInheritanceSequance(TileableCanvas, BaseClass, CLASS_NAME);

  return SavableCanvas as any;
};

export default SavableCanvasMixin;

export const SavableCanvas = SavableCanvasMixin<TileableCanvas>();
