export interface IHitBoxOptions {
  color: number;
}

export interface IHitBox {
  id: number;
  from: IPoint;
  to: IPoint;
  options?: IHitBoxOptions;
}

export default abstract class HitBox implements IHitBox {
  public abstract id: number;
  public abstract from: IPoint;
  public abstract to: IPoint;
  public abstract options?: IHitBoxOptions;
}
