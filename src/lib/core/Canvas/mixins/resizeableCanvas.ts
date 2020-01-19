import Canvas from '..';

const INCREASE_SIZE_MULTIPLIER = 2;
const DECREASE_SIZE_MULTIPLIER = 1 / 2;

const _onClickHandler = Symbol('_onClickHandler');
const _onContextMenuHandler = Symbol('_onContextMenuHandler');

/*
  @TODO Example
 */
const ResizeableCanvasMixin = (BaseClass = Canvas) => {
  if (!(BaseClass === Canvas || Canvas.isPrototypeOf(BaseClass))) {
    throw new Error('BaseClass isn\'t prototype of Canvas!');
  }

  class ResizeableCanvas extends BaseClass {
    private _sizeMultiplier = 1;

    public get sizeMultiplier() { return this._sizeMultiplier; }

    private [_onClickHandler](event: MouseEvent) {
      if (event.ctrlKey) {
        this._resize(INCREASE_SIZE_MULTIPLIER);
        event.preventDefault();
        event.stopPropagation();
        this._renderInNextFrame();
      }
    }

    private [_onContextMenuHandler](event: MouseEvent) {
      if (event.ctrlKey) {
        this._resize(DECREASE_SIZE_MULTIPLIER);
        event.preventDefault();
        event.stopPropagation();
        this._renderInNextFrame();
      }
    }

    protected _resize(multiplier: number) {
      this._sizeMultiplier *= multiplier;
      this.updateSize(this._el.width * multiplier, this._el.height * multiplier);
      // @ts-ignore
      if (super._resize instanceof Function) super._resize(multiplier);
    }

    constructor(options = {}) {
      super(options);

      this[_onClickHandler] = this[_onClickHandler].bind(this);
      this[_onContextMenuHandler] = this[_onContextMenuHandler].bind(this);
    }

    protected async _initListeners() {
      await super._initListeners();

      this._el.addEventListener('click', this[_onClickHandler]);
      this._el.addEventListener('contextmenu', this[_onContextMenuHandler], { capture: true });
    }
  }

  return ResizeableCanvas;
};

export default ResizeableCanvasMixin;

export const ResizeableCanvas = ResizeableCanvasMixin();
