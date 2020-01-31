import CanvasClassBuilder from '@/lib/core/Canvas/CanvasClassBuilder';

import PureCanvas from '@/lib/core/utils/classes/PureCanvas';
import buildEvent from '@/lib/core/utils/buildEvent';

import { getRandomArbitraryInt } from '@/utils/';

import GameObject, { IGameObjectMeta } from './index';

const _onMouseDownHandler = Symbol('_onMouseDownHandler');
const _onMouseMoveHandler = Symbol('_onMouseMoveHandler');
const _onMouseUpHandler = Symbol('_onMouseUpHandler');

const Canvas = new CanvasClassBuilder()
  .applyResizeableMixin()
  .build();

export default class GameObjectCanvas extends Canvas {
  private _gameObject: GameObject = null;

  private _modKey = 'shiftKey';

  private _eventDown: MouseEvent = null;
  private _eventMove: MouseEvent = null;

  public get gameObjectName() { return this._gameObject.name; }
  public set gameObjectName(value) { this._gameObject.name = value; }

  private [_onMouseDownHandler](event: MouseEvent) {
    if ((event as any)[this._modKey]) this._eventDown = event;
    this._el.addEventListener('mousemove', this[_onMouseMoveHandler], { passive: true });
  }

  private [_onMouseMoveHandler](event: MouseEvent) {
    if ((event as any)[this._modKey]) this._eventMove = event;
    this._renderInNextFrame();
  }

  private [_onMouseUpHandler](event: MouseEvent) {
    if (this._eventDown == null) return;
    if ((event as any)[this._modKey]) {
      this._el.removeEventListener('mousemove', this[_onMouseMoveHandler]);
      const from = {
        x: 0,
        y: 0,
      };
      const to = {
        x: 0,
        y: 0,
      };
      const options = {
        color: getRandomArbitraryInt(0, 300),
      };
      if (this._eventDown.offsetX > event.offsetX) {
        from.x = Math.round(event.offsetX / this.sizeMultiplier);
        to.x = Math.round(this._eventDown.offsetX / this.sizeMultiplier);
      } else {
        to.x = Math.round(event.offsetX / this.sizeMultiplier);
        from.x = Math.round(this._eventDown.offsetX / this.sizeMultiplier);
      }
      if (this._eventDown.offsetY > event.offsetY) {
        from.y = Math.round(event.offsetY / this.sizeMultiplier);
        to.y = Math.round(this._eventDown.offsetY / this.sizeMultiplier);
      } else {
        to.y = Math.round(event.offsetY / this.sizeMultiplier);
        from.y = Math.round(this._eventDown.offsetY / this.sizeMultiplier);
      }
      this._eventDown = null;
      this._eventMove = null;
      this._gameObject.appendHitBox(from, to, options);
      this.dispatchEvent(buildEvent(':hitBoxsUpdated', null, { hitBoxes: this._gameObject.hitBoxes }));
      this._renderInNextFrame();
    }
  }

  private _drawCurrentRect() {
    if (this._eventDown == null || this._eventMove == null) return;

    const ctx: CanvasRenderingContext2D = this._ctx;
    this._ctx.save();
    ctx.strokeStyle = 'hsla(0, 0%, 0%, .6)';

    ctx.strokeRect(
      this._eventDown.offsetX,
      this._eventDown.offsetY,
      this._eventMove.offsetX - this._eventDown.offsetX,
      this._eventMove.offsetY - this._eventDown.offsetY,
    );
    ctx.fillStyle = 'hsla(0, 0%, 100%, .2)';
    ctx.fillRect(
      this._eventDown.offsetX,
      this._eventDown.offsetY,
      this._eventMove.offsetX - this._eventDown.offsetX,
      this._eventMove.offsetY - this._eventDown.offsetY,
    );
    ctx.restore();
  }

  private _drawHitBoxes() {
    if (this._gameObject.hitBoxes.length === 0) return;

    const ctx: CanvasRenderingContext2D = this._ctx;
    this._ctx.save();
    for (const { from, to, options } of this._gameObject.hitBoxes) {
      ctx.strokeStyle = `hsla(${options.color}, 50%, 50%, .6)`;
      ctx.fillStyle = `hsla(${options.color}, 50%, 50%, .2)`;

      ctx.strokeRect(
        from.x * this.sizeMultiplier,
        from.y * this.sizeMultiplier,
        (to.x - from.x) * this.sizeMultiplier,
        (to.y - from.y) * this.sizeMultiplier,
      );
      ctx.fillRect(
        from.x * this.sizeMultiplier,
        from.y * this.sizeMultiplier,
        (to.x - from.x) * this.sizeMultiplier,
        (to.y - from.y) * this.sizeMultiplier,
      );
    }
    ctx.restore();
  }

  private _renderRenderedObject(renderedObject: IRenderedObject, selfBoundingRect: ISourceBoundingRect) {
    const boundingRect = renderedObject.sourceBoundingRect;
    this._ctx.drawImage(
      renderedObject.source,
      boundingRect.x,
      boundingRect.y,
      boundingRect.width,
      boundingRect.height,
      selfBoundingRect.x,
      selfBoundingRect.y,
      selfBoundingRect.width,
      selfBoundingRect.height,
    );
  }

  protected _render(...args: any[]) {
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled;
    this.clear();
    const selfBoundingRect = {
      x: 0,
      y: 0,
      width: this._el.width,
      height: this._el.height,
    };
    this._renderRenderedObject(this._gameObject, selfBoundingRect);

    this._drawHitBoxes();
    this._drawCurrentRect();
    // this.dispatchEvent(buildEvent(':render', null, { ctx: this._ctx }));
  }

  constructor(options: any = {}) {
    super(options);
    this._gameObject = new GameObject({});

    this[_onMouseDownHandler] = this[_onMouseDownHandler].bind(this);
    this[_onMouseMoveHandler] = this[_onMouseMoveHandler].bind(this);
    this[_onMouseUpHandler] = this[_onMouseUpHandler].bind(this);
  }

  async _initListeners() {
    await super._initListeners();

    this._el.addEventListener('mousedown', this[_onMouseDownHandler], { passive: true });
    this._el.addEventListener('mouseup', this[_onMouseUpHandler], { passive: true });
  }

  public updateSize(width: number, height: number) {
    super.updateSize(width, height);
  }

  public updateCache(image: CanvasImageSource) {
    this._gameObject.drawImage(image);
    this.updateSize(this._gameObject.width * this.sizeMultiplier, this._gameObject.height * this.sizeMultiplier);
    this.dispatchEvent(buildEvent(':hitBoxsUpdated', null, { hitBoxes: this._gameObject.hitBoxes }));
  }

  public clearGameObject(): void {
    this._gameObject.clear();
    this._renderInNextFrame();
    this.dispatchEvent(buildEvent(':hitBoxsUpdated', null, { hitBoxes: this._gameObject.hitBoxes }));
  }

  public save() {
    return this._gameObject.meta;
  }

  public async load(meta: IGameObjectMeta) {
    await this._gameObject.load(meta);
    const width = this._gameObject.sourceBoundingRect.width;
    while (160 / width > this.sizeMultiplier) this._sizeMultiplier *= 2;
    this.updateSize(this._gameObject.width * this.sizeMultiplier, this._gameObject.height * this.sizeMultiplier);
    this._renderInNextFrame();
  }
}
