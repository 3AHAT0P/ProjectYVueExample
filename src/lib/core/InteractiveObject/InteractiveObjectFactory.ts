import InteractiveObjectType from './InteractiveObjectType';
import InteractiveObject from './InteractiveObject';
import Character from './Character/Character';

const InteractiveObjectClassHash: Hash<typeof InteractiveObject> = {
  // @ts-ignore
  // [InteractiveObjectType.CHARACTER]: Character,
  [InteractiveObjectType.CHARACTER]: InteractiveObject,
  [InteractiveObjectType.IMPASSABLE_BLOCK]: InteractiveObject,
  [InteractiveObjectType.PLATFORM]: InteractiveObject,
  [InteractiveObjectType.COLLECTED_BLOCK]: InteractiveObject,
  [InteractiveObjectType.DANGEROUS_BLOCK]: InteractiveObject,
};

export default class InteractiveObjectFactory {
  static create(type: InteractiveObjectType, options: any) {
    return new (InteractiveObjectClassHash[type])(options);
  }
}
