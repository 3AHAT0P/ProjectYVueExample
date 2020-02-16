import GameObject, { IHitBox } from '@/lib/core/RenderedObject/GameObject/GameObject';

import Point from '@/lib/core/utils/classes/Point';

interface InteractiveObjectOptions {
  gameObject: GameObject,
  coordTiles?: Point[],
  position?: { x: number, y: number },
}

export default class InteractiveObject {
  private _gameObject: GameObject = null;
  private _coordTiles: Point[] = [];

  public position: { x: number; y: number };

  constructor(options: InteractiveObjectOptions) {
    if (options.gameObject) this._gameObject = options.gameObject;
    if (options.coordTiles) this._coordTiles = options.coordTiles;
    if (options.position) this.position = options.position;
  }

  checkTile(coord: Point): boolean {
    const equal = coord.isEqualToPoint.bind(coord);
    return this._coordTiles.find(equal) != null;
  }

  checkCollision(object: GameObject): boolean {
    // @TODO:
    return false;
  }

  render() {
    return this._gameObject.source;
  }

  get sourceBoundingRect() {
    return this._gameObject.sourceBoundingRect;
  }

  get width() {
    return this.sourceBoundingRect.width;
  }

  get height() {
    return this.sourceBoundingRect.height;
  }

  get hitBoxes() {
    return this._gameObject.hitBoxes;
  }

  setPosition(x: number, y: number) {
    this.position = { x, y };
  }
}
