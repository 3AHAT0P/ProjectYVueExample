import { TileableCanvas } from '@/lib/core/canvas/mixins/tileable-canvas';
import SelectableCanvasMixin from '@/lib/core/canvas/mixins/selectable-canvas';
import ResizeableCanvasMixin from '@/lib/core/canvas/mixins/resizeable-canvas';
import buildEvent from '@/utils/build-event';

interface MouseEventPoint {
  offsetX: number;
  offsetY: number;
}

interface MultiselectEvent {
  from: MouseEventPoint;
  to: MouseEventPoint;
}

export default class MineTileMap extends (SelectableCanvasMixin(ResizeableCanvasMixin(TileableCanvas)) as any) {
  private _imageSrcLink: string = null; // 'content/tilesets/main-tile-set.png';
  private _imageSrc: HTMLImageElement = null;

  private _metadataSrcLink: string = null; // 'content/tilesets/main-tile-set.json';
  private _metadataSrc: any = null;

  _onMultiSelect({ from, to }: MultiselectEvent) {
    const [xFrom, yFrom] = this._transformEventCoordsToGridCoords(from.offsetX, from.offsetY);
    const [xTo, yTo] = this._transformEventCoordsToGridCoords(to.offsetX, to.offsetY);
    const tiles = new Map<string, ImageBitmap>();
    for (let y = yFrom, _y = 0; y <= yTo; y += 1, _y += 1) {
      for (let x = xFrom, _x = 0; x <= xTo; x += 1, _x += 1) {
        tiles.set(`${_y}|${_x}`, this._getTile(x, y));
      }
    }
    this.dispatchEvent(buildEvent(':multiSelect', null, { tiles }));
  }

  constructor(options: any = {}) {
    // @ts-ignore
    // eslint-disable-next-line
    super(Object.assign({}, options, { size: { width: 0, height: 0 } }));

    this._imageSrcLink = options.imageUrl;
    this._metadataSrcLink = options.metadataUrl;
  }

  async init() {
    await this._loadImage();

    await super.init();

    await this._parse();
    // await this._loadMetadata();
    // await this.load({ meta: this._metadataSrc, img: this._imageSrc });

    this._renderInNextFrame();
  }

  async _initListeners() {
    await super._initListeners();
    this.addEventListener(':_multiSelect', this._onMultiSelect, { passive: true });
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

  async _parse() {
    const promises = [];
    for (let row = 0; row < this._rowsNumber; row += 1) {
      const y = row * this._tileSize.y;
      for (let col = 0; col < this._columnsNumber; col += 1) {
        const x = col * this._tileSize.x;
        promises.push(
          createImageBitmap(this._imageSrc, x, y, this._tileSize.x, this._tileSize.y)
            .then((tile: ImageBitmap) => this._updateTileByCoord(col, row, '0', tile)),
        );
      }
    }
  }

  async _loadMetadata() {
    this._metadataSrc = await (await fetch(this._metadataSrcLink)).json();
  }
}
