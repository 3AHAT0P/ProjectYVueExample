import buildEvent from '@/lib/core/utils/build-event';

import Canvas from '../canvas';

const _onMouseDownHandler = Symbol('_onMouseDownHandler');
const _onMouseUpHandler = Symbol('_onMouseUpHandler');

/*
  @TODO Example
 */
const SelectableCanvasMixin = (BaseClass = Canvas) => {
  if (!(BaseClass === Canvas || Canvas.isPrototypeOf(BaseClass))) {
    throw new Error('BaseClass isn\'t prototype of Canvas!');
  }

  class SelectableCanvas extends BaseClass {
    private _modKey = 'shiftKey';
    private _eventDown: MouseEvent = null;

    private [_onMouseDownHandler](event: MouseEvent) {
      if ((event as any)[this._modKey]) this._eventDown = event;
    }

    private [_onMouseUpHandler](event: MouseEvent) {
      if ((event as any)[this._modKey]) {
        const options = {
          ctx: this._ctx,
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
        this.dispatchEvent(buildEvent(':_multiSelect', null, options));
      }
    }

    constructor(options: any = {}) {
      super(options);

      if (options._modKey != null) this._modKey = options._modKey;

      this[_onMouseDownHandler] = this[_onMouseDownHandler].bind(this);
      this[_onMouseUpHandler] = this[_onMouseUpHandler].bind(this);
    }

    async _initListeners() {
      await super._initListeners();

      this._el.addEventListener('mousedown', this[_onMouseDownHandler], { passive: true });
      this._el.addEventListener('mouseup', this[_onMouseUpHandler], { passive: true });
    }
  }

  return SelectableCanvas;
};

export default SelectableCanvasMixin;

export const SelectableCanvas = SelectableCanvasMixin();
