import PureCanvas from '@/lib/core/utils/classes/PureCanvas';
import HitBox, { IHitBoxOptions } from '@/lib/core/HitBox/HitBox';

import RenderedObject, { IRenderedObjectOptions, IRenderedObjectMeta } from '../RenderedObject';

export interface ISpriteOptions extends IRenderedObjectOptions {
  name?: string;
  hitBoxes?: HitBox[];
  center?: IPoint;
  version?: string;
}

export interface ISpriteMeta extends IRenderedObjectMeta {
  name: string;
  hitBoxes: HitBox[];
  center?: IPoint;
  version: string;
}

export default class Sprite extends RenderedObject implements IRenderedObject {
  public static version = '0.1.0';

  private _isMirrored: { x: boolean, y: boolean } = { x: false, y: false };

  protected _sourceURL: string = null;
  protected _source: PureCanvas = new PureCanvas();

  protected _name: string = null;
  protected _hitBoxes: HitBox[] = [];

  protected _center: IPoint = { x: 0, y: 0 };

  public get name() { return this._name; }
  public set name(value: string) { this._name = value; }

  public get hitBoxes(): HitBox[] { return this._hitBoxes; }

  public get originaLCenter(): IPoint { return this._center; }
  public get center(): IPoint {
    return {
      x: this._isMirrored.x ? this._source.width - this._center.x : this._center.x,
      y: this._isMirrored.y ? this._source.width - this._center.y : this._center.y,
    };
  }

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
      center: this.center,
      version: Sprite.version,
    };
  }

  private _drawImage(image: CanvasImageSource) {
    this.clear();
    this._source.drawImageFullFilled(image);
  }

  private async _load() {
    if (this._sourceURL == null) return;
    await this._source.fromURL(this._sourceURL, true);

    const hitBox = this.hitBoxes[0];
    await this._source.ctx.strokeRect(
      hitBox.from.x,
      hitBox.from.y,
      hitBox.to.x - hitBox.from.x,
      hitBox.to.y - hitBox.from.y,
    );
  }

  public applyOptions(options: ISpriteOptions) {
    super.applyOptions(options);
    if (options.name != null) this._name = options.name;
    if (options.sourceURL != null) this._sourceURL = options.sourceURL;
    if (options.hitBoxes != null) {
      this._hitBoxes = options.hitBoxes.map((hitBox) => ({
        id: hitBox.id,
        from: {
          x: Number(hitBox.from.x),
          y: Number(hitBox.from.y),
        },
        to: {
          x: Number(hitBox.to.x),
          y: Number(hitBox.to.y),
        },
        options: hitBox.options,
      }));
    }
    this._source.applyOptions({});
    if (options.sourceBoundingRect != null) {
      this._source.resize(options.sourceBoundingRect.width, options.sourceBoundingRect.height);
    }
    if (options.center != null) {
      this._center.x = options.center.x;
      this._center.y = options.center.y;
    } else {
      this._center.x = 0; // options.sourceBoundingRect.width / 2;
      this._center.y = 0;
    }
  }

  public applyMeta(meta: ISpriteMeta) {
    super.applyMeta(meta);
    if (meta.version !== (this.constructor as any).version) throw new Error('Metadata version mismatch!');
    this._name = meta.name;
    this._sourceURL = meta.sourceURL;
    this._hitBoxes = meta.hitBoxes.map((hitBox) => ({
      id: hitBox.id,
      from: {
        x: Number(hitBox.from.x),
        y: Number(hitBox.from.y),
      },
      to: {
        x: Number(hitBox.to.x),
        y: Number(hitBox.to.y),
      },
      options: hitBox.options,
    }));
    this._source.applyOptions({});
    this._source.resize(meta.sourceBoundingRect.width, meta.sourceBoundingRect.height);
    if (meta.center != null) {
      this._center.x = meta.center.x;
      this._center.y = meta.center.y;
    } else {
      this._center.x = 0; // meta.sourceBoundingRect.width / 2;
      this._center.y = 0;
    }
  }

  public async init(): Promise<void> {
    await super.init();
    await this._load();
  }

  public appendHitBox(from: IPoint, to: IPoint, options?: IHitBoxOptions) {
    const hitBox: HitBox = {
      id: this._hitBoxes.length,
      from,
      to,
    };

    if (options) hitBox.options = options;
    this._hitBoxes.push(hitBox);
  }

  public clearHitBoxes(): void {
    this._hitBoxes = [];
  }

  public clear() {
    this._source.clear();
    this.clearHitBoxes();
  }

  public drawImage(image: CanvasImageSource) {
    this._source.resize(Number(image.width), Number(image.height));
    this._drawImage(image);
  }

  public mirror() {
    this._isMirrored.x = !this._isMirrored.x;
    this._source.flip('X', { x: 0, y: 0 });
  }
}
