import Canvas from './Canvas';

// eslint-disable-next-line max-len
import SelectableCanvasMixin, { ISelectableCanvas, ISelectableCanvasProtected, SelectableCanvasOptions } from './mixins/selectableCanvas';
// eslint-disable-next-line max-len
import ResizeableCanvasMixin, { IResizeableCanvas, IResizeableCanvasProtected, ResizeableCanvasOptions } from './mixins/resizeableCanvas';
// eslint-disable-next-line max-len
import TileableCanvasMixin, { ITileableCanvas, ITileableCanvasProtected, TileableCanvasOptions } from './mixins/tileableCanvas/tileableCanvas';
// eslint-disable-next-line max-len
import HoverableTileCanvasMixin, { IHoverableTileCanvas, IHoverableTileCanvasProtected, HoverableTileCanvasOptions } from './mixins/hoverableTileCanvas';
// eslint-disable-next-line max-len
import DrawableCanvasMixin, { IDrawableCanvas, IDrawableCanvasProtected, DrawableCanvasOptions } from './mixins/drawableCanvas';
// eslint-disable-next-line max-len
import SavableCanvasMixin, { ISavableCanvas, ISavableCanvasProtected, SavableCanvasOptions } from './mixins/savableCanvas';

export {
  Canvas,
  ISelectableCanvas,
  IResizeableCanvas,
  ITileableCanvas,
  IHoverableTileCanvas,
  IDrawableCanvas,
  ISavableCanvas,
  ISelectableCanvasProtected,
  IResizeableCanvasProtected,
  ITileableCanvasProtected,
  IHoverableTileCanvasProtected,
  IDrawableCanvasProtected,
  ISavableCanvasProtected,
  SelectableCanvasOptions,
  ResizeableCanvasOptions,
  TileableCanvasOptions,
  HoverableTileCanvasOptions,
  DrawableCanvasOptions,
  SavableCanvasOptions,
};

const MIXINS: Hash<any> = {
  selectable: SelectableCanvasMixin,
  resizable: ResizeableCanvasMixin,
  tileable: TileableCanvasMixin,
  hoverable: HoverableTileCanvasMixin,
  drawable: DrawableCanvasMixin,
  savable: SavableCanvasMixin,
};

export default class CanvasClassBuilder {
  private _class = Canvas;
  private _mixins: Hash<boolean> = {
    selectable: false,
    resizable: false,
    tileable: false,
    hoverable: false,
    drawable: false,
    savable: false,
  };

  applySelectableMixin() {
    this._mixins.selectable = true;
    return this;
  }

  applyResizeableMixin() {
    this._mixins.resizable = true;
    return this;
  }

  applyTileableMixin() {
    this._mixins.tileable = true;
    return this;
  }

  applyHoverableMixin() {
    this._mixins.hoverable = true;
    return this;
  }

  applyDrawableMixin() {
    this._mixins.drawable = true;
    return this;
  }

  applySavableMixin() {
    this._mixins.savable = true;
    return this;
  }

  build() {
    let _class = this._class;
    for (const [key, flag] of Object.entries(this._mixins)) {
      if (flag) _class = MIXINS[key](_class);
    }
    return _class;
  }

  instantiate(options: any) {
    const _class = this.build();
    return _class.create(options);
  }
}
