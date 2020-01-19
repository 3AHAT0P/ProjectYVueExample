import CanvasClassBuilder from '@/lib/core/canvas/builder';
import Tile from '@/lib/core/utils/tile';

interface MouseEventPoint {
  offsetX: number;
  offsetY: number;
}

interface MultiselectEvent {
  from: MouseEventPoint;
  to: MouseEventPoint;
}

const BaseClass = new CanvasClassBuilder()
  .applySelectableMixin()
  .applyResizeableMixin()
  .applyTileableMixin()
  .applyDrawableMixin()
  .build();

export default class TileMap extends BaseClass {
  private _imageSrcLink: string = null;
  private _imageSrc: HTMLImageElement = null;

  private _metadataSrcLink: string = null;
  private _metadataSrc: any = null;

  private _onMultiSelect({ from, to }: MultiselectEvent) {
    const [xFrom, yFrom] = this._transformEventCoordsToGridCoords(from.offsetX, from.offsetY);
    const [xTo, yTo] = this._transformEventCoordsToGridCoords(to.offsetX, to.offsetY);
    const tiles = new Map<string, Tile>();
    for (let y = yFrom, _y = 0; y <= yTo; y += 1, _y += 1) {
      for (let x = xFrom, _x = 0; x <= xTo; x += 1, _x += 1) {
        tiles.set(`${_y}|${_x}`, this._getTile(x, y, this.currentLayerIndex));
      }
    }
    this.updateCurrentTiles(tiles);
  }

  constructor(options: any = {}) {
    super(options);

    this._metadataSrcLink = options.metadataUrl;
  }

  async init() {
    await super.init();

    try {
      await this._loadMetadata();
      await this._loadImage();
      await this.load({ meta: this._metadataSrc, img: this._imageSrc });
    } catch (error) {
      console.error(error);
    }

    this._renderInNextFrame();
  }


  async _initListeners() {
    await super._initListeners();
    this.addEventListener(':_multiSelect', this._onMultiSelect, { passive: true });
  }

  private async _loadImage() {
    this._imageSrc = new Image();
    await new Promise((resolve, reject) => {
      this._imageSrc.onload = resolve;
      this._imageSrc.onerror = reject;
      this._imageSrc.src = this._imageSrcLink;
    });
  }

  private async _loadMetadata() {
    const metaDataJson = await (await fetch(this._metadataSrcLink)).json();
    this.updateSize(metaDataJson.tileMapSize.width, metaDataJson.tileMapSize.height);
    this._metadataSrc = metaDataJson;
    const sources: any = {};
    for (const [id, meta] of Object.entries<any>(this._metadataSrc.uniqTiles)) {
      if (sources[meta.sourceSrc] == null) {
        sources[meta.sourceSrc] = true;
        // @TODO: We could have situatuation,
        // when tile map have tiles from different tileSets
        this._imageSrcLink = meta.sourceSrc;
      }
    }
  }

  public async updateMetadataUrl(url: string = null) {
    if (url == null) return;

    this._metadataSrcLink = url;
    this._clearLayer('ALL');

    if (url !== '') {
      await this._loadMetadata();
      await this._loadImage();
      await this.load({ meta: this._metadataSrc, img: this._imageSrc });
    }

    this._renderInNextFrame();
  }
}
