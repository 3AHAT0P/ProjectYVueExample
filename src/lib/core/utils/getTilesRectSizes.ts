import Point from './classes/Point';

export default (tiles: Map<string, IRenderedObject>) => {
  /**
   * correct way to detect rect size
   let maxX = 0;
   let maxY = 0;
   for (const [place, tile] of tiles.entries()) {
    const [y, x] = place.split('|');
    if (Number(y) > maxY) maxY = Number(y);
    if (Number(x) > maxX) maxX = Number(x);
  }
   */

  // take just last key because it has the highest index of x and y
  const lastKey = Array.from(tiles.keys()).pop();
  const [xCount, yCount] = Point.fromReverseString(lastKey).toArray();

  // increment on 1 because count start from 0
  return {
    xCount: xCount + 1,
    yCount: yCount + 1,
  };
};
