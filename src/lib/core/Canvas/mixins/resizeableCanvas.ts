import { updateInheritanceSequance, checkInheritanceSequance } from '@/lib/core/utils';

import Canvas, { CanvasOptions, isCanvas } from '../Canvas';

export type ResizeableCanvasOptions = CanvasOptions & { };

const CLASS_NAME = Symbol.for('ResizeableCanvas');

export const isResizeable = (Class: any) => checkInheritanceSequance(Class, CLASS_NAME);

interface IResizeableCanvas {
  sizeMultiplier: number;
  normalizedWidth: number;
  normalizedHeight: number;

  _updateMultiplier: (multiplier: number) => void;
}

const INCREASE_SIZE_MULTIPLIER = 2;
const DECREASE_SIZE_MULTIPLIER = 1 / 2;

const _modKey = Symbol('_modKey');
const _onClickHandler = Symbol('_onClickHandler');
const _onContextMenuHandler = Symbol('_onContextMenuHandler');

/*
  @TODO Example
 */
const ResizeableCanvasMixin = <T = any>(BaseClass: Constructor = Canvas): Constructor<IResizeableCanvas & T> => {
  if (!isCanvas(BaseClass)) throw new Error('BaseClass isn\'t prototype of Canvas!');

  class ResizeableCanvas extends BaseClass {
    private [_modKey] = 'ctrlKey';
    private _sizeMultiplier = 1;

    public get sizeMultiplier() { return this._sizeMultiplier; }

    public get normalizedWidth() { return this.width / this.sizeMultiplier; }
    public get normalizedHeight() { return this.height / this.sizeMultiplier; }

    private [_onClickHandler](event: MouseEvent) {
      if ((event as Hash)[this[_modKey]]) {
        this._updateMultiplier(INCREASE_SIZE_MULTIPLIER);
        event.preventDefault();
        event.stopPropagation();
        this._renderInNextFrame();
      }
    }

    private [_onContextMenuHandler](event: MouseEvent) {
      if ((event as Hash)[this[_modKey]]) {
        this._updateMultiplier(DECREASE_SIZE_MULTIPLIER);
        event.preventDefault();
        event.stopPropagation();
        this._renderInNextFrame();
      }
    }

    protected _updateMultiplier(multiplier: number) {
      this._sizeMultiplier *= multiplier;
      this.resize(this.width * multiplier, this.height * multiplier);
      // @ts-ignore
      if (super._updateMultiplier instanceof Function) super._updateMultiplier(multiplier);
    }

    constructor(options: ResizeableCanvasOptions) {
      super(options);

      this[_onClickHandler] = this[_onClickHandler].bind(this);
      this[_onContextMenuHandler] = this[_onContextMenuHandler].bind(this);
    }

    protected async _initListeners() {
      await super._initListeners();

      this.canvas.addEventListener('click', this[_onClickHandler]);
      this.canvas.addEventListener('contextmenu', this[_onContextMenuHandler], { capture: true });
    }
  }

  updateInheritanceSequance(ResizeableCanvas, BaseClass, CLASS_NAME);

  return ResizeableCanvas as any;
};

export default ResizeableCanvasMixin;

export const ResizeableCanvas = ResizeableCanvasMixin<Canvas>();
