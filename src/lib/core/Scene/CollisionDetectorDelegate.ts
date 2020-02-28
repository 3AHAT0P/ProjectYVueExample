import InteractiveObject from '@/lib/core/InteractiveObject/InteractiveObject';

export interface ICollisionDetectorDelegate {
  getDistanceToSceneBoundary(object: InteractiveObject): IDistanceToObject;
  checkMoveCollisions(interactiveObject: InteractiveObject, offset: IPoint): IDistanceToObject;
}
