import throttle from 'lodash/throttle';

import buildEvent from '@/utils/build-event';

/*
  const canvas = await Canvas.create({ el: document.body, size: { width: 64, height: 64 } });
  canvas.addEventListener(
    'render',
    (event) => { if (tile != null) event.ctx.drawImage(tile, 0, 0, 64, 64); },
  );
 */
export default class Canvas extends EventTarget {
  public static async create(...args: any[]) {
    const instance = new this(...args);
    await instance.init();
    return instance;
  }

  protected _el: HTMLCanvasElement = null;
  protected _ctx: CanvasRenderingContext2D = null;

  protected _imageSmoothingEnabled = false;

  public el: HTMLElement = null;

  public get height() { return this._el.height; }
  public get width() { return this._el.width; }

  protected _renderInNextFrame() {
    requestAnimationFrame(this._render);
  }

  protected _render(...args: any[]) {
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
    this.clear();
    this.dispatchEvent(buildEvent(':render', null, { ctx: this._ctx }));
  }

  constructor(options: any = {}) {
    super();

    this._el = options.el;
    this._ctx = this._el.getContext('2d');

    this._render = throttle(this._render.bind(this), 16);
    this._renderInNextFrame = this._renderInNextFrame.bind(this);
  }

  async init() {
    Reflect.set(this._el.style, 'image-rendering', 'pixelated');
    this.el.append(this._el);

    await this._initListeners();

    this._renderInNextFrame();
  }

  async _initListeners() {
    this.addEventListener(':renderRequest', this._renderInNextFrame, { passive: true });
  }

  updateSize(width: number, height: number) {
    this._el.width = width;
    this._el.height = height;
  }

  clear(color: string = 'white') {
    this._ctx.save();
    this._ctx.fillStyle = color;
    this._ctx.fillRect(0, 0, this._el.width, this._el.height);
    this._ctx.restore();
  }
}
