import InteractiveObjectType from './InteractiveObjectType';
import InteractiveObject from './InteractiveObject';
import StaticInteractiveObject from './StaticInteractiveObject';
import Character from './Character/Character';

const InteractiveObjectClassHash: Hash<typeof InteractiveObject> = {
  // @ts-ignore
  // [InteractiveObjectType.CHARACTER]: Character,
  [InteractiveObjectType.CHARACTER]: StaticInteractiveObject,
  [InteractiveObjectType.IMPASSABLE_BLOCK]: StaticInteractiveObject,
  [InteractiveObjectType.PLATFORM]: StaticInteractiveObject,
  [InteractiveObjectType.COLLECTED_BLOCK]: StaticInteractiveObject,
  [InteractiveObjectType.DANGEROUS_BLOCK]: StaticInteractiveObject,
};

export default class InteractiveObjectFactory {
  static create(type: InteractiveObjectType, options: any) {
    // @ts-ignore
    return new (InteractiveObjectClassHash[type])(options);
  }
}
