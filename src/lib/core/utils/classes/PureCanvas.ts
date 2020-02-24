import loadImage from '../loadImage';
import nextMicro from '../delayers/nextMicro';

export type PureCanvasOptions = { imageSmoothingEnabled?: boolean; };

export default class PureCanvas {
  public static async create<T extends PureCanvas, G extends PureCanvasOptions>(options: G): Promise<T> {
    const instance = new this();
    instance.applyOptions(options);
    await instance.init();
    return <T>instance;
  }

  private _canvas: HTMLCanvasElement = document.createElement('canvas');
  private _ctx: CanvasRenderingContext2D = this._canvas.getContext('2d');

  private _imageSmoothingEnabled: boolean = false;

  public get canvas(): HTMLCanvasElement { return this._canvas; }
  public get ctx(): CanvasRenderingContext2D { return this._ctx; }

  public get width(): number { return this._canvas.width; }
  public get height(): number { return this._canvas.height; }

  protected _updateSource(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    Reflect.set(this._canvas.style, 'image-rendering', 'pixelated');
    this._ctx = this._canvas.getContext('2d');
  }

  protected _applyOptions(options: PureCanvasOptions): boolean {
    if (options == null) return false;

    if (options.imageSmoothingEnabled) this._imageSmoothingEnabled = options.imageSmoothingEnabled;

    return true;
  }

  protected _disableImageSmoothing() {
    this._imageSmoothingEnabled = false;
    this._applyImageSmoothing();
  }

  protected _applyImageSmoothing() {
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
  }

  constructor() {
    Reflect.set(this._canvas.style, 'image-rendering', 'pixelated');
  }

  public applyOptions(options: PureCanvasOptions) {
    this._applyOptions(options);
  }

  public async init(): Promise<void> {
    return null;
  }

  public resize(width: number, height: number) {
    if (Number.isSafeInteger(width)) this._canvas.width = width;
    if (Number.isSafeInteger(height)) this._canvas.height = height;
    this._applyImageSmoothing();
  }

  public drawImage(
    image: CanvasImageSource,
    sx: number, sy: number, sWidth: number, sHeight: number,
    dx: number, dy: number, dWidth: number, dHeight: number,
  ) {
    this._ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }

  public drawImageFullFilled(image: CanvasImageSource) {
    this.drawImage(image, 0, 0, Number(image.width), Number(image.height), 0, 0, this.width, this.height);
  }

  public fill(color: string = 'white') {
    this._ctx.save();
    this._ctx.fillStyle = color;
    this._ctx.fillRect(0, 0, this.width, this.height);
    this._ctx.restore();
  }

  public async flip(type?: 'X' | 'Y', offset: IPoint = { x: 0, y: 0 }) {
    const image = await createImageBitmap(this.canvas);
    this.clear();
    if (type === 'X') {
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(image, -image.width - offset.x, 0);
    }
    if (type === 'Y') {
      this.ctx.scale(1, -1);
      this.ctx.drawImage(image, 0, -image.height - offset.y);
    }
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    // this.ctx.strokeRect(0, 0, image.width, image.height);
  }

  public clear() {
    this._ctx.clearRect(0, 0, this.width, this.height);
    this._applyImageSmoothing();
  }

  public async fromURL(dataURL: string, getImageSize: boolean = false) {
    const image = await loadImage(dataURL);
    if (getImageSize) this.resize(image.width, image.height);
    this.drawImageFullFilled(image);
  }

  public toDataURL(applicationType: string, quality: number): string {
    return this._canvas.toDataURL(applicationType, quality);
  }
}
