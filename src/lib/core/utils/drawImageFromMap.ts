import Tile from './classes/Tile';
import Point from './classes/Point';
import getTilesRectSizes from './getTilesRectSizes';

export default (
  tiles: Map<string, Tile>,
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

  for (const [place, tile] of tiles.entries()) {
    const [y, x] = Point.fromString(place).toArray();
    ctx.drawImage(
      tile.source.data,
      tile.sourceRegion.x * tile.source.tileSize.x,
      tile.sourceRegion.y * tile.source.tileSize.y,
      tile.source.tileSize.x,
      tile.source.tileSize.y,
      x * tileWidth,
      y * tileHeight,
      tileWidth,
      tileHeight,
    );
  }
};
