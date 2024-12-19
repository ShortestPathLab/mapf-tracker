import { clamp } from "lodash";
import { useState } from "react";
import { useRafLoop } from "react-use";

export const lerp = (a: number, b: number, t: number) =>
  a * (1 - clamp(t, 0, 1)) + b * clamp(t, 0, 1);
export function useLerp(a: number, t: number = 0.1) {
  const [current, setCurrent] = useState(a);
  useRafLoop(() => setCurrent((p) => lerp(p, a, t)));
  return current;
}
