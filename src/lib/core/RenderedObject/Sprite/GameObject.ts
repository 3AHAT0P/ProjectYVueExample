import InteractiveObjectType from '@/lib/core/InteractiveObject/InteractiveObjectType';

import Sprite, { ISpriteOptions, ISpriteMeta } from './Sprite';

export interface IGameObjectOptions extends ISpriteOptions {
  type?: InteractiveObjectType;
}

export interface IGameObjectMeta extends ISpriteMeta {
  type: InteractiveObjectType;
}

export default class GameObject extends Sprite {
  public static version = '0.1.0';

  private _type: InteractiveObjectType = InteractiveObjectType.IMPASSABLE_BLOCK;

  public get type() { return this._type; }

  public get meta(): IGameObjectMeta {
    return {
      ...super.meta,
      type: this.type,
    };
  }
}
