import _memoize, { Options } from "p-memoize";

export const memoizeAsync = _memoize as <
  T extends (...arg0: any[]) => Promise<any>
>(
  t: T,
  opts?: Options<T, string>
) => T;
