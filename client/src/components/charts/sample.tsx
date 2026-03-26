import { floor } from "lodash";

export const sample =
  (n: number) =>
  <T,>(list: T[]) =>
    list.filter(
      (_, i, xs) =>
        // Is first
        i === 0 ||
        // Is last
        i === xs.length - 1 ||
        // Is evenly distributed
        i % (floor(xs.length / n) || 1) === 0,
    );
