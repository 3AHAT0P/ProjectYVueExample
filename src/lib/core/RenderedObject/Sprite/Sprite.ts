import PureCanvas from '@/lib/core/utils/classes/PureCanvas';
import HitBox, { IHitBoxOptions } from '@/lib/core/HitBox/HitBox';

import RenderedObject, { IRenderedObjectOptions, IRenderedObjectMeta } from '../RenderedObject';

export interface ISpriteOptions extends IRenderedObjectOptions {
  name?: string;
  hitBoxes?: HitBox[];
  version?: string;
}

export interface ISpriteMeta extends IRenderedObjectMeta {
  name: string;
  hitBoxes: HitBox[];
  version: string;
}

export default class Sprite extends RenderedObject implements IRenderedObject {
  public static version = '0.1.0';

  private _isMirrored: boolean = false;

  protected _sourceURL: string = null;
  protected _source: PureCanvas = new PureCanvas();

  protected _name: string = null;
  protected _hitBoxes: HitBox[] = [];

  public get name() { return this._name; }
  public set name(value: string) { this._name = value; }

  public get hitBoxes(): HitBox[] { return this._hitBoxes; }

  public get source(): CanvasImageSource { return this._source.canvas; }
  public get sourceURL(): string { return this._source.toDataURL('image/png', 1); }

  public get sourceBoundingRect(): IBoundingRect {
    return {
      x: 0,
      y: 0,
      width: this._source.width,
      height: this._source.height,
    };
  }

  public get meta(): ISpriteMeta {
    return {
      id: this.id,
      sourceURL: this.sourceURL,
      sourceBoundingRect: this.sourceBoundingRect,
      name: this.name,
      hitBoxes: this.hitBoxes,
      version: Sprite.version,
    };
  }

  private _drawImage(image: CanvasImageSource) {
    this.clear();
    this._source.drawImageFullFilled(image);
  }

  private async _load() {
    await this._source.fromDataURL(this._sourceURL, false);
  }

  public applyOptions(options: ISpriteOptions) {
    super.applyOptions(options);
    if (options.name != null) this._name = options.name;
    if (options.sourceURL != null) this._sourceURL = options.sourceURL;
    if (options.hitBoxes != null) this._hitBoxes = options.hitBoxes;
    this._source.applyOptions({});
    if (options.sourceBoundingRect != null) {
      this._source.resize(options.sourceBoundingRect.width, options.sourceBoundingRect.height);
    }
  }

  public applyMeta(meta: ISpriteMeta) {
    super.applyMeta(meta);
    if (meta.version !== (this.constructor as any).version) throw new Error('Metadata version mismatch!');
    this._name = meta.name;
    this._sourceURL = meta.sourceURL;
    this._hitBoxes = meta.hitBoxes;
    this._source.applyOptions({});
    this._source.resize(meta.sourceBoundingRect.width, meta.sourceBoundingRect.height);
  }

  public async init(): Promise<void> {
    await super.init();
    this._load();
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

  public mirror() {
    this._isMirrored = !this._isMirrored;
    this._source.flip('X');
  }
}