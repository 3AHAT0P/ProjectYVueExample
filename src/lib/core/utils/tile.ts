import { uuid } from '@/utils';

import Point from './point';

declare global {
  interface ISource {
    data?: HTMLImageElement | HTMLCanvasElement;
    url?: string;
    tileSize?: { x: number; y: number; };
  }
}

interface ITileConstructor {
  new(x: number, y: number): Tile;
  fromTileSet(source: ISource, tileOptions: any): Tile;
}

export default class Tile {
  static async fromTileSet(source: ISource, tileOptions: any) {
    const instance = new this({
      size: tileOptions.size || source.tileSize,
      sourceData: source.data,
      sourceSrc: source.url,
      sourceTileSize: source.tileSize,
      sourceCoords: tileOptions.sourceCoords,
    });
    return instance;
  }


  // static async fromTileSet(source: ISource, from: { x: number; y: number; }, tileOptions: any) {
  //   // const bitmap = await createImageBitmap(source.data, from.x, from.y, source.tileSize.x, source.tileSize.x);
  //   const instance = new this({
  //     bitmap: null,
  //     size: tileOptions.size || source.tileSize,
  //     sourceData: source.data,
  //     sourceSrc: source.url,
  //     sourceTileSize: source.tileSize,
  //     sourceCoords: tileOptions.sourceCoords,
  //   });
  //   return instance;
  // }

  private _id: string = null;

  private _size = {
    x: 16,
    y: 16,
  };

  private _source: ISource = {
    data: null,
    url: null,
    tileSize: {
      x: 16,
      y: 16,
    },
  };

  private _sourceRegion: Point = null;
  private _bitmap: ImageBitmap = null;

  public get id() { return this._id; }
  public set id(value: any) { throw new Error('It\'s property read only!'); }

  public get bitmap() { return this._bitmap; }
  public set bitmap(value: any) { throw new Error('It\'s property read only!'); }

  public get size() { return this._size; }
  public set size(value: any) { throw new Error('It\'s property read only!'); }

  public get source() { return this._source; }
  public set source(value: any) { throw new Error('It\'s property read only!'); }

  public get sourceRegion() { return this._sourceRegion.toObject(); }
  public set sourceRegion(value: any) { throw new Error('It\'s property read only!'); }

  public get meta() {
    return {
      id: this._id,
      sourceSrc: this._source.url,
      sourceCoords: this._sourceRegion.toObject(),
    };
  }
  public set meta(value: any) { throw new Error('It\'s property read only!'); }

  constructor(options: any = {}) {
    if (options.id != null) this._id = options.id;
    else this._id = uuid();
    if (options.size != null) this._size = { ...options.size };
    if (options.bitmap != null) this._bitmap = options.bitmap;
    if (options.sourceData != null) this._source.data = options.sourceData;
    if (options.sourceSrc != null) this._source.url = options.sourceSrc;
    if (options.sourceTileSize != null) this._source.tileSize = { ...options.sourceTileSize };
    if (options.sourceCoords != null) this._sourceRegion = new Point(options.sourceCoords.x, options.sourceCoords.y);
  }

  // @TODO: Tile should load own source, but we should use cache for loaded images
  // (in order to don't load one image extra times).

  // async loadSource() {
  //   // ...
  // }
}
