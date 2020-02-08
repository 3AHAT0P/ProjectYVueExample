export const copyArray = <T>(array: T[]): T[] => Array.from(array);

export const immutablePush = <T = any>(array: T[], item: T): T[] => {
  const newArray = array == null ? [] : copyArray(array);
  newArray.push(item);
  return newArray;
};
