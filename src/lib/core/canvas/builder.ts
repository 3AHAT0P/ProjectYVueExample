import Canvas from './canvas';

import SelectableCanvasMixin from './mixins/selectable-canvas';
import ResizeableCanvasMixin from './mixins/resizeable-canvas';
import TileableCanvasMixin from './mixins/tileable-canvas';
import DrawableCanvasMixin from './mixins/drawable-canvas';

const MIXINS: Hash = {
  selectable: SelectableCanvasMixin,
  resizable: ResizeableCanvasMixin,
  tileable: TileableCanvasMixin,
  drawable: DrawableCanvasMixin,
};

export default class CanvasClassBuilder {
  private klass: any = Canvas;
  private mixins: any = {
    selectable: false,
    resizable: false,
    tileable: false,
    drawable: false,
  };

  applySelectableMixin() {
    this.mixins.selectable = true;
    return this;
  }

  applyResizeableMixin() {
    this.mixins.resizable = true;
    return this;
  }

  applyTileableMixin() {
    this.mixins.tileable = true;
    return this;
  }

  applyDrawableMixin() {
    this.mixins.drawable = true;
    return this;
  }

  build() {
    let klass = this.klass;
    for (const [key, flag] of Object.entries(this.mixins)) {
      if (flag) klass = MIXINS[key](klass);
    }
    return klass;
  }

  instantiate(options: any) {
    const klass = this.build();
    return klass.create(options);
  }
}
