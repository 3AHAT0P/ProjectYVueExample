import Sprite, { ISpriteMeta } from './Sprite';

interface IEventHash {
  frameChange: Function[],
}

interface IFlipbookOptions {
  spriteMetaList: ISpriteMeta[];
  frameDuration?: number;
  waitBefore?: number;
  waitAfter?: number;
  repeat?: boolean;
}

interface IFlipbookMeta {
  spriteMetaList: ISpriteMeta[];
  frameDuration: number;
  waitBefore?: number;
  waitAfter?: number;
  repeat?: boolean;
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

  private spriteMetaList: ISpriteMeta[] = [];
  private _sprites: Sprite[] = [];
  private _currentSpriteIndex: number = 0;

  private _waitBeforeFirst: number = 0;
  private _waitAfterLast: number = 0;
  private _frameDuration: number = 0;
  private _timeOfLastFrameChange: number = null;

  private _isMirrored: boolean = false;
  private _isRepeated: boolean = true;

  public get currentSprite(): Sprite {
    return this._sprites[this._currentSpriteIndex];
  }

  private async _load() {
    try {
      const promises = [];
      for (const spriteMeta of this.spriteMetaList) promises.push(Sprite.fromMeta<Sprite>(spriteMeta));
      this._sprites = await Promise.all(promises);
    } catch (error) {
      throw new TypeError('Sprites of Flipbook should be an array of image links');
    }
  }

  private _nextFrame() {
    if (this._currentSpriteIndex < this._sprites.length - 1) this._currentSpriteIndex += 1;
    else if (this._isRepeated) {
      this._currentSpriteIndex = 0;
      return true;
    }
    return false;
  }

  public applyOptions(options: IFlipbookOptions) {
    if (options.spriteMetaList == null || options.spriteMetaList.length < 1) throw new Error('Sprites are required!');
    else this.spriteMetaList = options.spriteMetaList;
    if (options.frameDuration != null) this._frameDuration = options.frameDuration;
    if (options.waitBefore != null) this._waitBeforeFirst = options.waitBefore;
    if (options.waitAfter != null) this._waitAfterLast = options.waitAfter;
    if (options.repeat != null) this._isRepeated = options.repeat;
  }

  public applyMeta(meta: IFlipbookMeta) {

  }

  public async init(): Promise<void> {
    await this._load();
  }

  public tick(time: number) {
    if (
      time - this._timeOfLastFrameChange
      >= this._frameDuration + (this._currentSpriteIndex === 0 ? this._waitBeforeFirst : 0)
    ) {
      this._timeOfLastFrameChange = time;
      if (this._nextFrame()) this._timeOfLastFrameChange += this._waitAfterLast;
    }
  }

  public stop() {

  }

  public reset() {
    this._currentSpriteIndex = 0;
  }

  public mirror(value: boolean) {
    if (this._isMirrored === value) return;
    this._isMirrored = value;
    for (const sprite of this._sprites) sprite.mirror();
  }
}
