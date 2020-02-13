import CanvasClassBuilder, {
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
} from '@/lib/core/Canvas/CanvasClassBuilder';

import Point from '@/lib/core/utils/classes/Point';

interface MouseEventPoint {
  offsetX: number;
  offsetY: number;
}

interface MultiselectEvent {
  from: MouseEventPoint;
  to: MouseEventPoint;
}

type BaseInstanceType = Canvas &
  ISelectableCanvas & ISelectableCanvasProtected &
  IResizeableCanvas & IResizeableCanvasProtected &
  ITileableCanvas & ITileableCanvasProtected &
  IHoverableTileCanvas & IHoverableTileCanvasProtected &
  IDrawableCanvas & IDrawableCanvasProtected &
  ISavableCanvas & ISavableCanvasProtected;

type CanvasConstructor = typeof Canvas;

interface BaseClassType extends CanvasConstructor {
  new(): BaseInstanceType;
}

const BaseClass: BaseClassType = new CanvasClassBuilder()
  .applySelectableMixin()
  .applyResizeableMixin()
  .applyTileableMixin()
  .applyHoverableMixin()
  .applyDrawableMixin()
  .applySavableMixin()
  .build() as any;

type TileMapOptions = SelectableCanvasOptions &
  ResizeableCanvasOptions &
  TileableCanvasOptions &
  HoverableTileCanvasOptions &
  DrawableCanvasOptions &
  SavableCanvasOptions & { metadataUrl: string };

// @ts-ignore
export default class TileMap extends BaseClass {
  private _tileSets: Hash<HTMLImageElement> = {};

  private _metadataSrcLink: string = null;
  private _metadataSrc: any = null;

  private _onMultiSelect({ from, to }: MultiselectEvent) {
    const [xFrom, yFrom] = this._transformEventCoordsToGridCoords(from.offsetX, from.offsetY);
    const [xTo, yTo] = this._transformEventCoordsToGridCoords(to.offsetX, to.offsetY);
    const tiles = new Map<string, IRenderedObject>();
    for (let y = yFrom, _y = 0; y <= yTo; y += 1, _y += 1) {
      for (let x = xFrom, _x = 0; x <= xTo; x += 1, _x += 1) {
        const tile = this._getTile(x, y, this.currentLayerIndex);
        if (tile != null) tiles.set(new Point(_x, _y).toReverseString(), tile);
        else _x -= 1;
        if (x === xTo && _x <= 0) _y -= 1;
      }
    }
    if (tiles.size === 0) return;
    this.updateCurrentTiles(tiles);
    this.emit(':multiSelect', { tiles });
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

  private async _updateMetadata(metaDataJson: any) {
    if (metaDataJson == null) return;

    this.resize(
      metaDataJson.tileMapSize.width * this.sizeMultiplier,
      metaDataJson.tileMapSize.height * this.sizeMultiplier,
    );
    this._metadataSrc = metaDataJson;
    for (const [id, meta] of Object.entries<any>(this._metadataSrc.uniqGameObjects)) {
      if (this._tileSets[meta.sourceURL] == null) {
        this._tileSets[meta.sourceURL] = null;
      }
    }
  }

  protected async _initListeners() {
    await super._initListeners();
    this.on(':_multiSelect', this._onMultiSelect, this);
  }

  protected _applyOptions(options: TileMapOptions): boolean {
    if (!super._applyOptions(options)) throw new Error('metadataUrl is required option!');

    if (options.metadataUrl == null) console.log(42); // throw new Error('metadataUrl is required option!');
    else this._metadataSrcLink = options.metadataUrl;

    return true;
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
