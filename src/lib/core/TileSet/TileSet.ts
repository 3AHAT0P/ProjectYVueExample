import CanvasClassBuilder, {
  Canvas,
  ISelectableCanvas,
  IResizeableCanvas,
  ITileableCanvas,
  IHoverableTileCanvas,
  ISelectableCanvasProtected,
  IResizeableCanvasProtected,
  ITileableCanvasProtected,
  IHoverableTileCanvasProtected,
  SelectableCanvasOptions,
  ResizeableCanvasOptions,
  TileableCanvasOptions,
  HoverableTileCanvasOptions,
} from '@/lib/core/Canvas/CanvasClassBuilder';
import Tile from '@/lib/core/RenderedObject/Tile';
import Point from '@/lib/core/utils/classes/Point';

type BaseInstanceType = Canvas &
  ISelectableCanvas & ISelectableCanvasProtected &
  IResizeableCanvas & IResizeableCanvasProtected &
  ITileableCanvas & ITileableCanvasProtected &
  IHoverableTileCanvas & IHoverableTileCanvasProtected;

type CanvasConstructor = typeof Canvas;

interface BaseClassType extends CanvasConstructor {
  new(): BaseInstanceType;
}

const BaseClass: BaseClassType = new CanvasClassBuilder()
  .applySelectableMixin()
  .applyResizeableMixin()
  .applyTileableMixin()
  .applyHoverableMixin()
  .build() as any;

type TileSetOptions = SelectableCanvasOptions &
  ResizeableCanvasOptions &
  TileableCanvasOptions &
  HoverableTileCanvasOptions & { imageUrl: string; metadataUrl?: string; };

interface MouseEventPoint {
  offsetX: number;
  offsetY: number;
}

interface MultiselectEvent {
  from: MouseEventPoint;
  to: MouseEventPoint;
}

// @ts-ignore
export default class TileSet extends BaseClass {
  private _imageSrcLink: string = null;
  private _imageSrc: HTMLImageElement = null;

  private _metadataSrcLink: string = null;
  private _metadataSrc: any = null;

  private _onMultiSelect({ from, to }: MultiselectEvent) {
    const [xFrom, yFrom] = this._transformEventCoordsToGridCoords(from.offsetX, from.offsetY);
    const [xTo, yTo] = this._transformEventCoordsToGridCoords(to.offsetX, to.offsetY);
    const tiles = new Map<string, IRenderedObject>();
    for (let y = yFrom, _y = 0; y <= yTo; y += 1, _y += 1) {
      for (let x = xFrom, _x = 0; x <= xTo; x += 1, _x += 1) {
        tiles.set(new Point(_x, _y).toReverseString(), this._getTile(x, y));
      }
    }
    this.emit(':multiSelect', { tiles });
  }

  private async _loadImage() {
    if (this._imageSrcLink == null || this._imageSrcLink === '') throw new Error('URL is not settled!');
    this._imageSrc = new Image();
    await new Promise((resolve, reject) => {
      this._imageSrc.onload = resolve;
      this._imageSrc.onerror = reject;
      this._imageSrc.src = this._imageSrcLink;
    });
    this.resize(this._imageSrc.width, this._imageSrc.height);
  }

  private async _parse() {
    const sourceURL = this._imageSrcLink;
    const source = this._imageSrc;
    const { x: columns, y: rows } = this.sizeInTiles;
    const cellSize = this.cellSize;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const tile = new Tile({
          source,
          sourceURL,
          sourceBoundingRect: {
            x: col * cellSize.x,
            y: row * cellSize.y,
            width: cellSize.x,
            height: cellSize.y,
          },
        });
        this._updateTileByCoord(col, row, '0', tile);
      }
    }
  }

  private async _loadMetadata() {
    if (this._metadataSrcLink == null || this._metadataSrcLink === '') throw new Error('URL is not settled!');
    this._metadataSrc = await (await fetch(this._metadataSrcLink)).json();
  }

  protected async _initListeners() {
    await super._initListeners();
    this.on(':_multiSelect', this._onMultiSelect, this);
  }

  protected _applyOptions(options: TileSetOptions): boolean {
    if (!super._applyOptions(options)) throw new Error('imageUrl is required option!');
    if (options.imageUrl == null) throw new Error('imageUrl is required option!');
    this._imageSrcLink = options.imageUrl;
    this._metadataSrcLink = options.metadataUrl;
    return true;
  }

  public async init() {
    await this._loadImage();

    await super.init();

    await this._parse();
    // await this._loadMetadata();
    // await this.load({ meta: this._metadataSrc, img: this._imageSrc });

    this._renderInNextFrame();
  }

  public async updateImageUrl(url: string = null) {
    if (url == null) return;

    this._imageSrcLink = url;

    this._clearLayer('ALL');

    await this._loadImage();
    await this._parse();

    this._renderInNextFrame();
  }
}
