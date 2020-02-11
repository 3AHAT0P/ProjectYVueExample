import { updateInheritanceSequance, checkInheritanceSequance } from '@/lib/core/utils';

import Canvas, { CanvasOptions, isCanvas } from '../Canvas';

export type SelectableCanvasOptions = CanvasOptions & { modKey?: string; };

const CLASS_NAME = Symbol.for('SelectableCanvas');

export const isSelectable = (Class: any) => checkInheritanceSequance(Class, CLASS_NAME);

const _modKey = Symbol('_modKey');
const _onMouseDownHandler = Symbol('_onMouseDownHandler');
const _onMouseUpHandler = Symbol('_onMouseUpHandler');

export interface ISelectableCanvas {

}

export interface ISelectableCanvasProtected {
  _applyOptions(options: SelectableCanvasOptions): boolean;
  _initListeners(): Promise<void>;
}

/*
  @TODO Example
 */
const SelectableCanvasMixin = (BaseClass: typeof Canvas) => {
  // eslint-disable-next-line no-use-before-define
  if (isSelectable(BaseClass)) return (BaseClass as any) as typeof SelectableCanvas;
  if (!isCanvas(BaseClass)) throw new Error('BaseClass isn\'t prototype of Canvas!');

  // @ts-ignore
  class SelectableCanvas extends BaseClass implements ISelectableCanvas {
    private [_modKey] = 'shiftKey';
    private _eventDown: MouseEvent = null;

    private [_onMouseDownHandler](event: MouseEvent) {
      if ((event as Hash)[this[_modKey]]) this._eventDown = event;
    }

    private [_onMouseUpHandler](event: MouseEvent) {
      if ((event as Hash)[this[_modKey]]) {
        const options = {
          ctx: this.ctx,
          eventDown: this._eventDown,
          eventUp: event,
          from: {
            offsetX: 0,
            offsetY: 0,
          },
          to: {
            offsetX: 0,
            offsetY: 0,
          },
        };
        if (this._eventDown.offsetX > event.offsetX) {
          options.from.offsetX = event.offsetX;
          options.to.offsetX = this._eventDown.offsetX;
        } else {
          options.to.offsetX = event.offsetX;
          options.from.offsetX = this._eventDown.offsetX;
        }
        if (this._eventDown.offsetY > event.offsetY) {
          options.from.offsetY = event.offsetY;
          options.to.offsetY = this._eventDown.offsetY;
        } else {
          options.to.offsetY = event.offsetY;
          options.from.offsetY = this._eventDown.offsetY;
        }
        this._eventDown = null;
        this.emit(':_multiSelect', options);
      }
    }

    protected _applyOptions(options: SelectableCanvasOptions): boolean {
      if (!super._applyOptions(options)) return false;

      if (options.modKey != null) this[_modKey] = options.modKey;

      return true;
    }

    protected async _initListeners() {
      await super._initListeners();

      this.canvas.addEventListener('mousedown', this[_onMouseDownHandler], { passive: true });
      this.canvas.addEventListener('mouseup', this[_onMouseUpHandler], { passive: true });
    }

    constructor(options: SelectableCanvasOptions) {
      super(options);

      this[_onMouseDownHandler] = this[_onMouseDownHandler].bind(this);
      this[_onMouseUpHandler] = this[_onMouseUpHandler].bind(this);
    }
  }

  updateInheritanceSequance(SelectableCanvas, BaseClass, CLASS_NAME);

  return SelectableCanvas;
};

export default SelectableCanvasMixin;

export const SelectableCanvas = SelectableCanvasMixin(Canvas);
