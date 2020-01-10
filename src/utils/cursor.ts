
const updateImageColorVolume = (imageData) => {
  let pixels = imageData.data;
  for(let i = 0; i < pixels.length; i += 4) {
    // red is pixels[i];
    // green is pixels[i + 1];
    // blue is pixels[i + 2];
    // alpha is pixels[i + 3];
    // all values are integers between 0 and 255
    // do with them whatever you like. Here we are reducing the color volume to 98%
    // without affecting the alpha channel
    pixels[i] = pixels[i] * 0.95;
    pixels[i+1] = pixels[i+1] * 0.85;
    pixels[i+2] = pixels[i+2] * 0.85;
  }
  return imageData;
}

export default class Cursor {
  _el = null;
  _url = null;
  _offset = {
    x: 0,
    y: 0,
  };

  get cursor() {
    return `url(${this._url}) ${this._offset.x} ${this._offset.y}, pointer`;
  }

  constructor(target, options) {
    this._el = target;

    if (options.offset != null) this._offset = options.offset;
  }

  async updateImageFromBitmap(bitmap) {
    const canvas = document.createElement('canvas');
    canvas.style['image-rendering'] = 'pixelated';
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
    
    // When we use image from canvas as a cursor, image brightness and color volume is increased. So we need decrease it before set as the cursor
    let imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    imageData = updateImageColorVolume(imageData);
    ctx.putImageData(imageData, 0, 0);
    const data = await new Promise((resolve) => canvas.toBlob(resolve));
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