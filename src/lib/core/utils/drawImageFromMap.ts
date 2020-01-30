import Tile from './classes/Tile';
import Point from './classes/Point';
import getTilesRectSizes from './getTilesRectSizes';

export default (
  tiles: Map<string, IRenderedObject>,
  ctx: CanvasRenderingContext2D,
  width: number = 64,
  height: number = 64,
  contain: boolean = false,
) => {
  const canvasWidth = width;
  const canvasHeight = height;
  const { xCount, yCount } = getTilesRectSizes(tiles);

  const maxAxios = Math.max(xCount, yCount);
  const tileWidth = canvasWidth / (contain ? maxAxios : xCount);
  const tileHeight = canvasHeight / (contain ? maxAxios : yCount);


  // eslint-disable-next-line no-param-reassign
  ctx.imageSmoothingEnabled = false;
  for (const [place, tile] of tiles.entries()) {
    const [y, x] = Point.fromString(place).toArray();
    const tileBoundingRect = tile.sourceBoundingRect;
    ctx.drawImage(
      tile.source,
      tileBoundingRect.x,
      tileBoundingRect.y,
      tileBoundingRect.width,
      tileBoundingRect.height,
      x * tileWidth,
      y * tileHeight,
      tileWidth,
      tileHeight,
    );
  }
};
