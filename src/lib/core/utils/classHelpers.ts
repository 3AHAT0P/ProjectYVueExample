import { immutablePush } from './arrayHelpers';

export const inheritanceSequanceKey = '_metaClassNames';

export const updateInheritanceSequance = (Class: any, BaseClass: any, ClassName: any): void => {
  let newSequance = [];
  if (BaseClass == null) newSequance = immutablePush([], ClassName);
  else newSequance = immutablePush(BaseClass[inheritanceSequanceKey], ClassName);
  /* eslint-disable-next-line no-param-reassign */
  Class[inheritanceSequanceKey] = newSequance;
};

export const checkInheritanceSequance = (Class: any, ClassName: any): boolean => {
  if (!Array.isArray(Class[inheritanceSequanceKey])) return false;

  return Class[inheritanceSequanceKey].includes(ClassName);
};
