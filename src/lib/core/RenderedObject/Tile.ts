import RenderedObject, { IRenderedObjectOptions, IRenderedObjectMeta } from './RenderedObject';

export interface ITileOptions extends IRenderedObjectOptions {
}

export interface ITileMeta extends IRenderedObjectMeta {
}

export default class Tile extends RenderedObject implements IRenderedObject {
  public static async fromMeta<T extends RenderedObject = Tile>(
    meta: IRenderedObjectMeta,
    source: CanvasImageSource = null,
  ) {
    return super.fromMeta<T>({
      ...meta,
      source,
    });
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

  public applyOptions(options: ITileOptions) {
    super.applyOptions(options);
    if (options.source != null) this._source = options.source;
    if (options.sourceURL != null) this._sourceURL = options.sourceURL;

    if (options.sourceBoundingRect != null) {
      this._sourceBoundingRect.x = options.sourceBoundingRect.x;
      this._sourceBoundingRect.y = options.sourceBoundingRect.y;
      this._sourceBoundingRect.width = options.sourceBoundingRect.width;
      this._sourceBoundingRect.height = options.sourceBoundingRect.height;
    }
  }

  public applyMeta(meta: ITileMeta) {
    super.applyOptions(meta);
    this._source = meta.source;
    this._sourceURL = meta.sourceURL;

    this._sourceBoundingRect.x = meta.sourceBoundingRect.x;
    this._sourceBoundingRect.y = meta.sourceBoundingRect.y;
    this._sourceBoundingRect.width = meta.sourceBoundingRect.width;
    this._sourceBoundingRect.height = meta.sourceBoundingRect.height;
  }

  // @TODO: Tile should load own source, but we should use cache for loaded images
  // (in order to don't load one image extra times).

  // async loadSource() {
  //   // ...
  // }
}
