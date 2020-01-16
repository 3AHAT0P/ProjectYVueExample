import { DrawableCanvas } from '@/lib/core/canvas/mixins/drawable-canvas';

export default class TileMap extends DrawableCanvas {
  private _imageSrcLink: string = null; // '/content/tilemaps/tilemap.png';
  private _imageSrc: HTMLImageElement = null;

  private _metadataSrcLink: string = null; // '/content/tilemaps/tilemap.json';
  private _metadataSrc: any = null;

  constructor(options: any = {}) {
    super(options);

    this._imageSrcLink = options.imageUrl;
    this._metadataSrcLink = options.metadataUrl;
  }

  async init() {
    await super.init();

    await this._loadMetadata();
    await this._loadImage();
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
  }

  async _loadMetadata() {
    const metaDataJson = await (await fetch(this._metadataSrcLink)).json();
    this.updateSize(metaDataJson.tileMapSize.width, metaDataJson.tileMapSize.height);
    this._metadataSrc = metaDataJson.tileHash;
    const sources: any = {};
    for (const [place, meta] of Object.entries<any>(this._metadataSrc)) {
      if (sources[meta.sourceSrc] == null) {
        sources[meta.sourceSrc] = true;
        // @TODO: We could have situatuation,
        // when tile map have tiles from different tileSets
        this._imageSrcLink = meta.sourceSrc;
      }
    }
  }
}
