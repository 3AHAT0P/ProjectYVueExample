interface IGameObjectMeta {
  name: string;
  size: { x: number; y: number; };
  data: string;
  hitBoxes: IHitBox[];
}

interface IHitBoxOptions {
  color: number;
}

interface IHitBox {
  id: number;
  from: IPoint;
  to: IPoint;
  options: IHitBoxOptions;
}

export default class GameObject implements IRenderedObject {
  public static fromMeta(meta: IGameObjectMeta) {
    const instance = new this();
    instance.load(meta);
    return instance;
  }

  private _source: HTMLCanvasElement = document.createElement('canvas');
  private _ctx: CanvasRenderingContext2D = this._source.getContext('2d');

  private _name: string = null;
  private _hitBoxes: IHitBox[] = [];

  private _imageSmoothingEnabled: boolean = false;

  public get source(): CanvasImageSource {
    return this._source;
  }

  public get name() {
    return this._name;
  }
  public set name(value: string) {
    this._name = value;
  }

  public get hitBoxes(): IHitBox[] {
    return this._hitBoxes;
  }

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

  public _drawImage(image: CanvasImageSource) {
    this.clear();
    this._ctx.drawImage(image, 0, 0, Number(image.width), Number(image.height), 0, 0, this.width, this.height);
  }

  constructor(options: any = {}) {
    if (options.name) this._name = options.name;
    if (options.size != null) {
      this._source.width = options.size.width;
      this._source.height = options.size.height;
    }
    if (options.hitBoxes != null) this._hitBoxes = options.hitBoxes;

    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;

    this._drawImage = this._drawImage.bind(this);
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
    this._ctx.clearRect(0, 0, this.width, this.height);
    this._hitBoxes = [];
  }

  public drawImage(image: CanvasImageSource) {
    this._source.width = Number(image.width);
    this._source.height = Number(image.height);
    this._drawImage(image);
  }

  public save(): IGameObjectMeta {
    const data = this._source.toDataURL('image/png', 1);
    const hitBoxes = this._hitBoxes;
    return {
      name: this.name,
      size: {
        x: this.width,
        y: this.height,
      },
      data,
      hitBoxes,
    };
  }

  public async load({
    name,
    size,
    data,
    hitBoxes,
  }: IGameObjectMeta) {
    this._name = name;
    this._source.width = size.x;
    this._source.height = size.y;
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this._drawImage(img);
        resolve();
      };
      img.onerror = reject;
      img.src = data;
    });
    this._hitBoxes = hitBoxes;
  }
}
