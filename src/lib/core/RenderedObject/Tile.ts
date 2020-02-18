import RenderedObject, { IRenderedObjectOptions, IRenderedObjectMeta } from './RenderedObject';

export interface ITileOptions extends IRenderedObjectOptions {
}

export interface ITileMeta extends IRenderedObjectMeta {
}

export default class Tile extends RenderedObject implements IRenderedObject {
  public static fromMeta(meta: ITileMeta, source: CanvasImageSource = null) {
    const instance = new this({
      ...meta,
      source,
    });
    return instance;
  }

  private _source: CanvasImageSource = null;
  private _sourceURL: string = null;
  private _sourceBoundingRect: IBoundingRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  public get id() { return this._id; }
  public get source() { return this._source; }
  public get sourceURL() { return this._sourceURL; }
  public get sourceBoundingRect() { return this._sourceBoundingRect; }

  public get meta() {
    return {
      id: this._id,
      sourceURL: this._sourceURL,
      sourceBoundingRect: this.sourceBoundingRect,
    };
  }

  constructor(options: ITileOptions = {}) {
    super(options);
    if (options.source != null) this._source = options.source;
    if (options.sourceURL != null) this._sourceURL = options.sourceURL;

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
