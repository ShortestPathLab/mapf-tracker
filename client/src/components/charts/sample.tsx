import { floor } from "lodash";

export const sample =
  (n: number) =>
  <T,>(list: T[]) =>
    list.filter((_, i, xs) => i % (floor(xs.length / n) || 1) === 0);
