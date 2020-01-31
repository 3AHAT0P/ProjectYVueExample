import loadImage from '../loadImage';

export default class PureCanvas {
  protected _canvas: HTMLCanvasElement = document.createElement('canvas');
  protected _ctx: CanvasRenderingContext2D = this._canvas.getContext('2d');

  protected _imageSmoothingEnabled: boolean = false;

  public get canvas(): HTMLCanvasElement { return this._canvas; }
  public get ctx(): CanvasRenderingContext2D { return this._ctx; }

  public get width(): number { return this._canvas.width; }
  public get height(): number { return this._canvas.height; }

  constructor(options: any = {}) {
    if (options.imageSmoothingEnabled) this._imageSmoothingEnabled = options.imageSmoothingEnabled;
  }

  resize(width: number, height: number) {
    if (Number.isSafeInteger(width)) this._canvas.width = width;
    if (Number.isSafeInteger(height)) this._canvas.height = height;
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
  }

  drawImage(
    image: CanvasImageSource,
    sx: number, sy: number, sWidth: number, sHeight: number,
    dx: number, dy: number, dWidth: number, dHeight: number,
  ) {
    this._ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }

  drawImageFullFilled(image: CanvasImageSource) {
    this.drawImage(image, 0, 0, Number(image.width), Number(image.height), 0, 0, this.width, this.height);
  }

  clear() {
    this._ctx.clearRect(0, 0, this.width, this.height);
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
  }

  async fromDataURL(dataURL: string, getImageSize: boolean = false) {
    const image = await loadImage(dataURL);
    if (getImageSize) this.resize(image.width, image.height);
    this.drawImageFullFilled(image);
  }

  toDataURL(applicationType: string, quality: number) {
    return this._canvas.toDataURL(applicationType, quality);
  }
}
