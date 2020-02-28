import { uuid } from '@/lib/core/utils';

export interface IRenderedObjectOptions {
  id?: string;
  source?: CanvasImageSource;
  sourceURL?: string;
  sourceBoundingRect?: IBoundingRect;
}

export interface IRenderedObjectMeta extends IRenderedObjectOptions {
  id: string;
  sourceURL: string;
  sourceBoundingRect: IBoundingRect;
}

export default abstract class RenderedObject implements IRenderedObject {
  public static async create<T extends RenderedObject>(options: IRenderedObjectOptions): Promise<T> {
    if (this === RenderedObject) throw new Error('It\'s abstract class!');
    // @ts-ignore
    const instance = new this();
    instance.applyOptions(options);
    await instance.init();
    return instance;
  }
  public static async fromMeta<T extends RenderedObject>(meta: IRenderedObjectMeta): Promise<T> {
    if (this === RenderedObject) throw new Error('It\'s abstract class!');
    // @ts-ignore
    const instance = new this();
    instance.applyMeta(meta);
    await instance.init();
    return instance;
  }

  protected _id: string = null;

  public get id(): string { return this._id; }

  public abstract get source(): CanvasImageSource;
  public abstract get sourceURL(): string;
  public abstract get sourceBoundingRect(): IBoundingRect;

  public get meta(): IRenderedObjectMeta {
    return {
      id: this.id,
      sourceURL: this.sourceURL,
      sourceBoundingRect: this.sourceBoundingRect,
    };
  }

  public applyOptions(options: IRenderedObjectOptions) {
    if (options.id != null) this._id = options.id;
    else this._id = uuid();
  }

  public applyMeta(meta: IRenderedObjectMeta) {
    this._id = meta.id;
  }

  public async init(): Promise<void> {
    return null;
  }
}
