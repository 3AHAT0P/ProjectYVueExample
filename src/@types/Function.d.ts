declare global {
  type fn<T = any> = (...args: any[]) => T;
  type cb = fn;
}

export { };
