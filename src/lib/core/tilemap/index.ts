import { DrawableCanvas } from '@/lib/core/canvas/mixins/drawable-canvas';

export default class MineTileMap extends DrawableCanvas {
  private _imageSrcLink: string = null; // '/content/tilemaps/tilemap.png';
  private _imageSrc: HTMLImageElement = null;

  private _metadataSrcLink: string = null; // '/content/tilemaps/tilemap.json';
  private _metadataSrc: any = null;

  constructor(options: any = {}) {
    super(options);

    this._imageSrcLink = options.imageUrl;
    this._metadataSrcLink = options.metadataUrl;
    console.log(options);
  }

  async init() {
    await super.init();

    await this._loadImage();
    await this._loadMetadata();
    await this.load({ meta: this._metadataSrc, img: this._imageSrc });

    this._renderInNextFrame();
  }

  async _loadImage() {
    this._imageSrc = new Image();
    await new Promise((resolve, reject) => {
      this._imageSrc.onload = resolve;
      this._imageSrc.onerror = reject;
      this._imageSrc.src = this._imageSrcLink;
    });
    this.updateSize(this._imageSrc.width, this._imageSrc.height);
  }

  async _loadMetadata() {
    this._metadataSrc = await (await fetch(this._metadataSrcLink)).json();
  }
}
