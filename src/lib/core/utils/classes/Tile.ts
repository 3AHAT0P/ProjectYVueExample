import { uuid } from '@/utils';

import Point from './Point';

declare global {
  interface ISource {
    data?: HTMLImageElement | HTMLCanvasElement;
    url?: string;
    tileSize?: IPoint;
  }
}

interface ITileMeta {
  id?: string;
  source: string;
  sourceData?: CanvasImageSource;
  sourceBoundingRect: ISourceBoundingRect;
}

export default class Tile implements IRenderedObject {
  static async fromTileSet(source: ISource, tileOptions: any) {
    const instance = new this({
      source,
      ...tileOptions,
    });
    return instance;
  }

  static fromTileMeta(meta: ITileMeta, imageCache: Hash = null) {
    // eslint-disable-next-line no-param-reassign
    if (meta.sourceData == null) meta.sourceData = imageCache[meta.source];
    const instance = new this({
      ...meta,
    });
    return instance;
  }

  private _id: string = null;

  private _source: CanvasImageSource = null;
  private _sourceUrl: string = null;
  private _sourceBoundingRect: ISourceBoundingRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  public get id() { return this._id; }
  public set id(value: any) { throw new Error('It\'s property read only!'); }

  public get source() { return this._source; }
  public set source(value: any) { throw new Error('It\'s property read only!'); }

  public get sourceBoundingRect() { return this._sourceBoundingRect; }
  public set sourceBoundingRect(value: any) { throw new Error('It\'s property read only!'); }

  public get meta() {
    return {
      id: this._id,
      source: this._sourceUrl,
      sourceBoundingRect: this.sourceBoundingRect,
    };
  }
  public set meta(value: any) { throw new Error('It\'s property read only!'); }

  constructor(options: any = {}) {
    if (options.id != null) this._id = options.id;
    else this._id = uuid();

    if (options.source != null) this._sourceUrl = options.source;
    if (options.sourceData != null) this._source = options.sourceData;

    // if (options.sourceRegion != null) {
    //   // @TODO: Old format
    //   this._sourceBoundingRect.width = options.source.tileSize.x;
    //   this._sourceBoundingRect.height = options.source.tileSize.y;
    //   this._sourceBoundingRect.x = options.sourceRegion.x * this._sourceBoundingRect.width;
    //   this._sourceBoundingRect.y = options.sourceRegion.y * this._sourceBoundingRect.height;
    // }

    if (options.sourceBoundingRect != null) {
      this._sourceBoundingRect.x = options.sourceBoundingRect.x;
      this._sourceBoundingRect.y = options.sourceBoundingRect.y;
      this._sourceBoundingRect.width = options.sourceBoundingRect.width;
      this._sourceBoundingRect.height = options.sourceBoundingRect.height;
    }
  }

  // @TODO: Tile should load own source, but we should use cache for loaded images
  // (in order to don't load one image extra times).

  // async loadSource() {
  //   // ...
  // }
}
