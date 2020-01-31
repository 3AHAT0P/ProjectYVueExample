import { uuid } from '@/utils';

export interface IRenderedObjectOptions {
  id?: string;
  source?: CanvasImageSource;
  sourceURL?: string;
  sourceBoundingRect?: ISourceBoundingRect;
}

export interface IRenderedObjectMeta extends IRenderedObjectOptions {
  id: string;
  sourceURL: string;
  sourceBoundingRect: ISourceBoundingRect;
}

export default abstract class RenderedObject implements IRenderedObject {
  public static fromMeta(meta: IRenderedObjectMeta): any {
    if (this === RenderedObject) throw new Error('It\'s abstract method!');
    // @ts-ignore
    const instance = new this(meta);
    return instance;
  }

  protected _id: string = null;

  public get id(): string { return this._id; }

  public abstract get source(): CanvasImageSource;
  public abstract get sourceURL(): string;
  public abstract get sourceBoundingRect(): ISourceBoundingRect;

  public get meta(): IRenderedObjectMeta {
    return {
      id: this.id,
      sourceURL: this.sourceURL,
      sourceBoundingRect: this.sourceBoundingRect,
    };
  }

  constructor(options: IRenderedObjectOptions) {
    if (options.id != null) this._id = options.id;
    else this._id = uuid();
  }
}
