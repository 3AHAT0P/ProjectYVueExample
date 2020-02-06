import GameObject from '@/lib/core/RenderedObject/GameObject/GameObject';

import Point from '@/lib/core/utils/classes/Point';

export default class InteractiveObject {
  private _gameObject: GameObject = null;

  private _coordTiles: Point[] = [];

  constructor(options: any = {}) {
    if (options.gameObject) this._gameObject = options.gameObject;
    if (options.coordTiles) this._coordTiles = options.coordTiles;
  }

  checkTile(coord: Point): boolean {
    const equal = coord.isEqualToPoint.bind(coord);
    return this._coordTiles.find(equal) != null;
  }

  checkCollision(object: GameObject): boolean {
    // @TODO:
    return false;
  }
}
