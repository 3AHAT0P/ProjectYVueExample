import throttle from 'lodash/throttle';

import buildEvent from '@/lib/core/utils/buildEvent';

/*
  const canvas = await Canvas.create({ el: document.body, size: { width: 64, height: 64 } });
  canvas.addEventListener(
    'render',
    (event) => { if (tile != null) event.ctx.drawImage(tile, 0, 0, 64, 64); },
  );
 */
export default class Canvas extends EventTarget {
  public static _metaClassNames: Symbol[] = [];

  public static async create<T extends Canvas>(...args: any[]): Promise<T> {
    const instance = new this(...args);
    await instance.init();
    return <T>instance;
  }

  protected _el: HTMLCanvasElement = null;
  protected _ctx: CanvasRenderingContext2D = null;

  protected _imageSmoothingEnabled = false;

  public get height() { return this._el.height; }
  public get width() { return this._el.width; }

  public get normalizedHeight() { return this.height; }
  public get normalizedWidth() { return this.width; }

  protected async _initListeners() {
    this.addEventListener(':renderRequest', this._renderInNextFrame, { passive: true });
  }

  protected _renderInNextFrame() {
    requestAnimationFrame(this._render);
  }

  protected _render(time: number) {
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
    this.clear();
    this.dispatchEvent(buildEvent(':render', null, { ctx: this._ctx }));
  }

  constructor(options: any = {}) {
    super();

    this._el = options.el;
    if (options.size != null) {
      this._el.width = options.size.width;
      this._el.height = options.size.height;
    }
    this._ctx = this._el.getContext('2d');

    this._render = throttle(this._render.bind(this), 16);
    this._renderInNextFrame = this._renderInNextFrame.bind(this);
  }

  async init() {
    Reflect.set(this._el.style, 'image-rendering', 'pixelated');

    await this._initListeners();

    this._renderInNextFrame();
  }

  public updateSize(width: number, height: number) {
    this._el.width = width;
    this._el.height = height;
  }

  public fill(color: string = 'white') {
    this._ctx.save();
    this._ctx.fillStyle = color;
    this._ctx.fillRect(0, 0, this._el.width, this._el.height);
    this._ctx.restore();
  }

  public clear() {
    this._ctx.clearRect(0, 0, this._el.width, this._el.height);
  }
}
