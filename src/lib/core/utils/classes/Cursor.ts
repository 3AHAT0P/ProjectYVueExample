import updateImageColorVolume from '../updateImageColorVolume';
import drawImageFromMap from '../drawImageFromMap';
import getTilesRectSizes from '../getTilesRectSizes';

export default class Cursor {
  _el: HTMLElement = null;
  _url: string = null;
  _offset = {
    x: 0,
    y: 0,
  };

  get cursor() {
    return `url(${this._url}) ${this._offset.x} ${this._offset.y}, pointer`;
  }

  constructor(target: HTMLElement, options: any) {
    this._el = target;

    if (options.offset != null) this._offset = options.offset;
  }

  async updateImageFromTilemap(tilemap: Map<string, IRenderedObject>) {
    const canvas = document.createElement('canvas');
    Reflect.set(canvas.style, 'image-rendering', 'pixelated');
    const { xCount, yCount } = getTilesRectSizes(tilemap);


    canvas.width = 16 * xCount > 128 ? 128 : 16 * xCount;
    canvas.height = 16 * yCount > 128 ? 128 : 16 * yCount;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawImageFromMap(tilemap, ctx, canvas.width, canvas.height);

    // When we use image from canvas as a cursor,
    // image brightness and color volume is increased. So we need decrease it before set as the cursor
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    imageData = updateImageColorVolume(imageData);
    ctx.putImageData(imageData, 0, 0);
    const data = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
    this._url = URL.createObjectURL(data);

    // this._url = canvas.toDataURL();
  }

  showCursor() {
    this._el.style.cursor = this.cursor;
  }

  hideCursor() {
    this._el.style.cursor = 'unset';
  }
}
