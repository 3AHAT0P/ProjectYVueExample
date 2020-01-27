import { uuid } from '@/utils';

import Point from './Point';

declare global {
  interface ISource {
    data?: HTMLImageElement | HTMLCanvasElement;
    url?: string;
    tileSize?: IPoint;
  }
}

interface ITileConstructor {
  new(x: number, y: number): Tile;
  fromTileSet(source: ISource, tileOptions: any): Tile;
}

interface ITileMeta {
  id?: string;
  source: ISource;
  sourceRegion: Point | IPoint;
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

  static fromTileMeta(meta: ITileMeta, tileSize: IPoint, imageCache: Hash = {}) {
    // eslint-disable-next-line no-param-reassign
    if (meta.source.data == null) meta.source.data = imageCache[meta.source.url];
    const instance = new this({
      ...meta,
      size: tileSize || meta.source.tileSize,
    });
    return instance;
  }


  // static async fromTileSet(source: ISource, from: IPoint, tileOptions: any) {
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

  public get id() { return this._id; }
  public set id(value: any) { throw new Error('It\'s property read only!'); }

  public get size() { return this._size; }
  public set size(value: any) { throw new Error('It\'s property read only!'); }

  public get source() { return this._source; }
  public set source(value: any) { throw new Error('It\'s property read only!'); }

  public get sourceRegion() { return this._sourceRegion.toObject(); }
  public set sourceRegion(value: any) { throw new Error('It\'s property read only!'); }

  public get meta() {
    return {
      id: this._id,
      source: {
        url: this.source.url,
        tileSize: this.source.tileSize,
      },
      sourceRegion: this.sourceRegion,
    };
  }
  public set meta(value: any) { throw new Error('It\'s property read only!'); }

  constructor(options: any = {}) {
    if (options.id != null) this._id = options.id;
    else this._id = uuid();

    if (options.size != null) {
      this._size.x = options.size.x;
      this._size.y = options.size.y;
    }

    if (options.source != null) {
      this._source.data = options.source.data;
      this._source.url = options.source.url;
      this._source.tileSize.x = options.source.tileSize.x;
      this._source.tileSize.y = options.source.tileSize.y;
    } else {
      // @TODO: Old format
      if (options.sourceData != null) this._source.data = options.sourceData;
      if (options.sourceSrc != null) this._source.url = options.sourceSrc;
      if (options.sourceTileSize != null) this._source.tileSize = { ...options.sourceTileSize };
    }

    if (options.sourceRegion != null) this._sourceRegion = new Point(options.sourceRegion.x, options.sourceRegion.y);
    else if (options.sourceCoords != null) {
      // @TODO: Old format
      this._sourceRegion = new Point(options.sourceCoords.x, options.sourceCoords.y);
    }
  }

  // @TODO: Tile should load own source, but we should use cache for loaded images
  // (in order to don't load one image extra times).

  // async loadSource() {
  //   // ...
  // }
}
