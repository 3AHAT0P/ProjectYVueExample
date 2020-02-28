import GameObject, { IGameObjectMeta } from './GameObject';
import SpriteCanvas from './SpriteCanvas';

export default class GameObjectCanvas extends SpriteCanvas {
  protected _sprite: GameObject = null;

  public async init() {
    await super.init();
    this._sprite = await GameObject.create<GameObject>({});
  }

  public async load(meta: IGameObjectMeta) {
    await super.load(meta);
  }
}
