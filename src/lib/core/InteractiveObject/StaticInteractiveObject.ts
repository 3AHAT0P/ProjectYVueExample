import GameObject from '@/lib/core/RenderedObject/Sprite/GameObject';
import Sprite from '@/lib/core/RenderedObject/Sprite/Sprite';

import InteractiveObject, { InteractiveObjectOptions } from './InteractiveObject';

interface StaticInteractiveObjectOptions extends InteractiveObjectOptions {
  gameObject: GameObject,
}

export default class StaticInteractiveObject extends InteractiveObject {
  private _gameObject: GameObject = null;

  protected get _sprite(): Sprite { return this._gameObject; }

  constructor(options: StaticInteractiveObjectOptions) {
    super(options);
    if (options.gameObject) this._gameObject = options.gameObject;
  }
}
