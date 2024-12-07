export const tryChain = <T>(...fns: Array<() => T>): T => {
  for (const fn of fns) {
    try {
      return fn();
    } catch (e) {
      // ignore
      /**/
    }
  }
  throw new Error("All functions in tryChain failed");
};
