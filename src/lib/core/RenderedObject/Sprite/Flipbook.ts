import Sprite from './Sprite';

interface IEventHash {
  frameChange: Function[],
}

interface IFlipbookOptions {
  spriteURLs: string[];
  frameDuration?: number;
}

interface IFlipbookMeta {
  spriteURLs: string[];
  frameDuration: number;
}

/**
 * Flipbook is used to animate multiple images (like GIFs)
 */
export default class Flipbook {
  public static version = '0.1.0';

  public static async create(options: IFlipbookOptions) {
    const instance = new this();
    instance.applyOptions(options);
    await instance.init();
    return instance;
  }

  private _spriteUrls: string[] = [];
  private _sprites: Sprite[] = [];
  private _currentSpriteIndex: number = 0;

  private _frameDuration: number = 0;
  private _timeOfLastFrameChange: number = null;

  private _isMirrored: boolean = false;

  public get currentSprite(): Sprite {
    return this._sprites[this._currentSpriteIndex];
  }

  private async _load() {
    try {
      const promises = [];
      for (const sourceURL of this._spriteUrls) promises.push(Sprite.create<Sprite>({ sourceURL }));
      this._sprites = await Promise.all(promises);
    } catch (error) {
      throw new TypeError('Sprites of Flipbook should be an array of image links');
    }
  }

  private _nextFrame() {
    this._currentSpriteIndex += 1;
    if (this._currentSpriteIndex >= this._sprites.length) this._currentSpriteIndex = 0;
  }

  public applyOptions(options: IFlipbookOptions) {
    if (options.spriteURLs == null || options.spriteURLs.length < 1) throw new Error('Sprites are required!');
    else this._spriteUrls = options.spriteURLs;
    if (options.frameDuration) this._frameDuration = options.frameDuration;
  }

  public applyMeta(meta: IFlipbookMeta) {

  }

  public async init(): Promise<void> {
    this._load();
  }

  public tick(time: number) {
    if (time - this._timeOfLastFrameChange >= this._frameDuration) {
      this._nextFrame();
    }
  }

  public stop() {

  }

  public reset() {
    this._currentSpriteIndex = 0;
  }

  public mirror() {
    this._isMirrored = !this._isMirrored;
    for (const sprite of this._sprites) sprite.mirror();
  }
}
