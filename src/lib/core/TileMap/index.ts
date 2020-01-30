import CanvasClassBuilder from '@/lib/core/Canvas/CanvasClassBuilder';
import Tile from '@/lib/core/utils/classes/Tile';
import buildEvent from '@/lib/core/utils/buildEvent';

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
  private _tileSets: Hash<HTMLImageElement> = {};

  private _metadataSrcLink: string = null;
  private _metadataSrc: any = null;

  private _onMultiSelect({ from, to }: MultiselectEvent) {
    const [xFrom, yFrom] = this._transformEventCoordsToGridCoords(from.offsetX, from.offsetY);
    const [xTo, yTo] = this._transformEventCoordsToGridCoords(to.offsetX, to.offsetY);
    const tiles = new Map<string, Tile>();
    for (let y = yFrom, _y = 0; y <= yTo; y += 1, _y += 1) {
      for (let x = xFrom, _x = 0; x <= xTo; x += 1, _x += 1) {
        const tile = this._getTile(x, y, this.currentLayerIndex);
        if (tile != null) tiles.set(`${_y}|${_x}`, tile);
        else _x -= 1;
        if (x === xTo && _x <= 0) _y -= 1;
      }
    }
    if (tiles.size === 0) return;
    this.updateCurrentTiles(tiles);
    this.dispatchEvent(buildEvent(':multiSelect', null, { tiles }));
  }

  constructor(options: any = {}) {
    super(options);

    this._metadataSrcLink = options.metadataUrl;
  }

  async init() {
    await super.init();

    try {
      await this._loadMetadata();
      await this._loadImages();
      await this.load({ meta: this._metadataSrc, imageHash: this._tileSets });
    } catch (error) {
      console.error(error);
    }

    this._renderInNextFrame();
  }


  async _initListeners() {
    await super._initListeners();
    this.addEventListener(':_multiSelect', this._onMultiSelect, { passive: true });
  }

  private async _loadImages() {
    const promises = [];

    for (const [url, _] of Object.entries(this._tileSets)) {
      this._tileSets[url] = new Image();
      promises.push(new Promise((resolve, reject) => {
        this._tileSets[url].onload = resolve;
        this._tileSets[url].onerror = reject;
        this._tileSets[url].src = url;
      }));
    }

    await Promise.all(promises);
  }

  private async _loadMetadata() {
    if (this._metadataSrcLink == null || this._metadataSrcLink === '') throw new Error('URL is not settled!');
    const metaDataJson = await (await fetch(this._metadataSrcLink)).json();
    await this._updateMetadata(metaDataJson);
  }

  public async _updateMetadata(metaDataJson: any) {
    if (metaDataJson == null) return;

    this.updateSize(
      metaDataJson.tileMapSize.width * this.sizeMultiplier,
      metaDataJson.tileMapSize.height * this.sizeMultiplier,
    );
    this._metadataSrc = metaDataJson;
    for (const [id, meta] of Object.entries<any>(this._metadataSrc.uniqGameObjects)) {
      if (this._tileSets[meta.source] == null) {
        this._tileSets[meta.source] = null;
      }
    }
  }

  public async updateMetadataUrl(url: string = null) {
    if (url == null) return;

    this._metadataSrcLink = url;
    this._clearLayer('ALL');

    if (url !== '') {
      await this._loadMetadata();
      await this._loadImages();
      await this.load({ meta: this._metadataSrc, imageHash: this._tileSets });
    }

    this._renderInNextFrame();
  }

  public async updateMetadata(metaDataJson: any) {
    if (metaDataJson == null) return;

    this._metadataSrcLink = null;
    this._clearLayer('ALL');

    await this._updateMetadata(metaDataJson);
    await this._loadImages();
    await this.load({ meta: this._metadataSrc, imageHash: this._tileSets });

    this._renderInNextFrame();
  }
}
