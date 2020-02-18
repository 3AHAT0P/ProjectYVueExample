import Sprite from './Sprite';

interface IEventHash {
  frameChange: Function[],
}

interface IFlipbookOptions {
  frameDuration?: number,
  mirror?: boolean,
}

declare global {
  interface IFlipbook {
    create(sprites: string[], options?: IFlipbookOptions): Promise<IFlipbook>,
    init(): void,
    load(): void,
    start(): void,
    stop(): void,
    on(event: string, handler: Function): void
    currentSprite: HTMLCanvasElement,
    width: number,
    height: number,
  }
}

/**
 * Flipbook is used to animate multiple images (like GIFs)
 */
export default class Flipbook {
  public options = {
    frameDuration: 100,
    mirror: false,
  };
  private _spriteUrls: string[] = [];
  private _sprites: Sprite[] = [];
  private _eventHash: IEventHash = {
    frameChange: [],
  };
  private _currentSprite: Sprite = null;
  private _currentSpriteIndex = 0;
  private _timer: number = null;
  private _availableEvents = ['frameChange'];
  private _offscreenCanvas: HTMLCanvasElement = null;
  private _renderer: CanvasRenderingContext2D = null;

  /**
   * @constructs The main method to create Flipbook.
   * @param {string[]} sprites - array of image links
   * @param {Object} [options] - meta info for Flippbok
   * @param {number} [options.frameDuration=300] - duration between frames
   * @param {boolean} [options.mirror=false] - if true all sprites would be mirrored
   * @returns {Promise<Flipbook>}
   */
  public static async create(sprites: string[], options?: IFlipbookOptions) {
    const instance = new this(sprites, options);
    await instance.init();
    return instance;
  }

  constructor(sprites: string[], options: IFlipbookOptions = {}) {
    if (sprites == null || sprites.length < 1) throw new Error('Sprites are required!');
    if (options.frameDuration) this.options.frameDuration = options.frameDuration;
    if (options.mirror) this.options.mirror = options.mirror;
    this._spriteUrls = sprites;
  }

  async init() {
    for (const url of this._spriteUrls) this._sprites.push(new Sprite(url));
    await this.load();
    this._currentSprite = this._sprites[0];
    this._createOffscreenCanvas();
  }

  async load() {
    try {
      await Promise.all(this._sprites.map((sprite) => sprite.load()));
    } catch (error) {
      throw new TypeError('Sprites of Flipbook should be an array of image links');
    }
  }

  get currentSprite() {
    return this._offscreenCanvas;
  }

  start() {
    this.stop();
    this._updateSize();
    this._render();
    if (this._sprites.length > 1) {
      this._timer = setInterval(() => {
        this._currentSprite = this._sprites[this._currentSpriteIndex];
        this._updateSize();
        this._render();
        this._callEventHandlers('frameChange', [this._currentSpriteIndex + 1, this._sprites.length]);

        const nextSpriteIndex = this._currentSpriteIndex + 1;

        if (nextSpriteIndex >= this._sprites.length) this._currentSpriteIndex = 0;
        else this._currentSpriteIndex = nextSpriteIndex;
      }, this.options.frameDuration);
    }
  }

  stop() {
    clearInterval(this._timer);
    this._currentSpriteIndex = 0;
    this._currentSprite = this._sprites[this._currentSpriteIndex];
  }

  /**
   * Standard way to add event handler
   * @param event
   * @param handler
   */
  on(event: string, handler: Function) {
    if (typeof event === 'string' && this._availableEvents.includes(event) && handler instanceof Function) {
      // @ts-ignore
      this._eventHash[event].push(handler);
    }
  }

  get width() {
    return this._offscreenCanvas.width;
  }

  get height() {
    return this._offscreenCanvas.height;
  }

  _createOffscreenCanvas() {
    this._offscreenCanvas = document.createElement('canvas');
    this._updateSize();
    this._renderer = this._offscreenCanvas.getContext('2d');
    this._renderer.imageSmoothingEnabled = false;
  }

  _updateSize() {
    this._offscreenCanvas.width = this._currentSprite.width;
    this._offscreenCanvas.height = this._currentSprite.height;
  }

  _render() {
    const isMirror = this.options.mirror;
    this._renderer.clearRect(0, 0, this.width, this.height);
    if (isMirror) this._renderer.scale(-1, 1);
    this._renderer.drawImage(
      this._currentSprite.currentSprite,
      0,
      0,
      this._currentSprite.width,
      this._currentSprite.height,
      // TODO it's hard code now. It should be passed through some options.
      isMirror ? 20 : 0,
      0,
      this.width * (isMirror ? -1 : 1),
      this.height,
    );
  }

  _callEventHandlers(event: string, argumentsList: any[]) {
    // @ts-ignore
    if (this._eventHash[event].length) {
      // @ts-ignore
      this._eventHash[event].forEach((handler: Function) => handler(...argumentsList));
    }
  }
}
