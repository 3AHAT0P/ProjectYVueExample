import InteractiveObject from '@/lib/core/InteractiveObject/InteractiveObject';

export interface ICollisionDetectorDelegate {
  inSceneBound(object: InteractiveObject): boolean;
  checkMoveCollisions(interactiveObject: InteractiveObject, offset: IPoint): IDistanceToObject;
}
