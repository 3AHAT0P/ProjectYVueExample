import PureCanvas from '@/lib/core/utils/classes/PureCanvas';

import RenderedObject, { IRenderedObjectOptions, IRenderedObjectMeta } from '../RenderedObject';

export interface IGameObjectOptions extends IRenderedObjectOptions {
  name?: string;
  hitBoxes?: IHitBox[];
  version?: string;
}

export interface IGameObjectMeta extends IRenderedObjectMeta {
  name: string;
  hitBoxes: IHitBox[];
  version: string;
}

export interface IHitBoxOptions {
  color: number;
}

export interface IHitBox {
  id: number;
  from: IPoint;
  to: IPoint;
  options: IHitBoxOptions;
}

export default class GameObject extends RenderedObject implements IRenderedObject {
  public static version = '0.1.0';

  public static async fromMeta(meta: IGameObjectMeta) {
    const instance = new this(meta);
    await instance.load(meta);
    return instance;
  }

  private _source: PureCanvas = new PureCanvas();

  private _name: string = null;
  private _hitBoxes: IHitBox[] = [];

  public get name() { return this._name; }
  public set name(value: string) { this._name = value; }

  public get hitBoxes(): IHitBox[] { return this._hitBoxes; }

  public get source(): CanvasImageSource { return this._source.canvas; }
  public get sourceURL(): string { return this._source.toDataURL('image/png', 1); }

  public get sourceBoundingRect(): ISourceBoundingRect {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  public get width(): number { return this._source.width; }
  public get height(): number { return this._source.height; }

  public get meta(): IGameObjectMeta {
    return {
      id: this.id,
      sourceURL: this.sourceURL,
      sourceBoundingRect: this.sourceBoundingRect,
      name: this.name,
      hitBoxes: this.hitBoxes,
      version: GameObject.version,
    };
  }

  private _drawImage(image: CanvasImageSource) {
    this.clear();
    this._source.drawImageFullFilled(image);
  }

  constructor(options: any) {
    super(options);
    this._source.applyOptions({});
  }

  public appendHitBox(from: IPoint, to: IPoint, options: IHitBoxOptions) {
    this._hitBoxes.push({
      id: this._hitBoxes.length,
      from,
      to,
      options,
    });
  }

  public clear() {
    this._source.clear();
    this._hitBoxes = [];
  }

  public drawImage(image: CanvasImageSource) {
    this._source.resize(Number(image.width), Number(image.height));
    this._drawImage(image);
  }

  public async load({
    id,
    sourceURL,
    sourceBoundingRect,
    name,
    hitBoxes,
    version,
  }: IGameObjectMeta) {
    if (version !== GameObject.version) throw new Error('Metadata version mismatch!');

    this._id = id;
    this._name = name;
    this._source.resize(sourceBoundingRect.width, sourceBoundingRect.height);
    await this._source.fromDataURL(sourceURL, false);
    this._hitBoxes = hitBoxes;
  }
}
