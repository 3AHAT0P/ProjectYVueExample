import Canvas from './Canvas';

import SelectableCanvasMixin from './mixins/selectableCanvas';
import ResizeableCanvasMixin from './mixins/resizeableCanvas';
import TileableCanvasMixin from './mixins/tileableCanvas/tileableCanvas';
import HoverableTileCanvasMixin from './mixins/hoverableTileCanvas';
import DrawableCanvasMixin from './mixins/drawableCanvas';

const MIXINS: Hash = {
  selectable: SelectableCanvasMixin,
  resizable: ResizeableCanvasMixin,
  tileable: TileableCanvasMixin,
  hoverable: HoverableTileCanvasMixin,
  drawable: DrawableCanvasMixin,
};

export default class CanvasClassBuilder {
  private _class: typeof Canvas = Canvas;
  private _mixins: any = {
    selectable: false,
    resizable: false,
    tileable: false,
    hoverable: false,
    drawable: false,
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
