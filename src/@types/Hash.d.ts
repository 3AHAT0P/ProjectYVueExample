declare global {
  abstract class Hash<T = any> {
    [key: string]: T;
    [key: number]: T;
  }
}

export { };
