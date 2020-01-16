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
  fromTileSet(value: string): Tile;
}

export default class Tile {
  static async fromTileSet(source: ISource, from: { x: number; y: number; }, tileOptions: any) {
    const bitmap = await createImageBitmap(source.data, from.x, from.y, source.tileSize.x, source.tileSize.x);
    const instance = new this({
      bitmap,
      size: tileOptions.size || source.tileSize,
      sourceSrc: source.url,
      sourceTileSize: source.tileSize,
      sourceCoords: tileOptions.sourceCoords,
    });
    return instance;
  }

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

  public get bitmap() { return this._bitmap; }
  public set bitmap(value: any) { throw new Error('It\'s property read only!'); }

  public get size() { return this._size; }
  public set size(value: any) { throw new Error('It\'s property read only!'); }

  public get meta() {
    return {
      sourceSrc: this._source.url,
      sourceCoords: this._sourceRegion.toObject(),
    };
  }
  public set meta(value: any) { throw new Error('It\'s property read only!'); }

  constructor(options: any = {}) {
    if (options.size != null) this._size = { ...options.size };
    if (options.bitmap != null) this._bitmap = options.bitmap;
    if (options.sourceSrc != null) this._source.url = options.sourceSrc;
    if (options.sourceTileSize != null) this._source.tileSize = { ...options.sourceTileSize };
    if (options.sourceCoords != null) this._sourceRegion = new Point(options.sourceCoords.x, options.sourceCoords.y);
  }
}
