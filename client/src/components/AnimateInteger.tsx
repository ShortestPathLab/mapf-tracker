import { round } from "lodash";
import { useState } from "react";
import { useRafLoop } from "react-use";

const lerp = (start: number, end: number, t: number) =>
  start * (1 - t) + end * t;

export function AnimateInteger({ value = 0 }: { value?: number }) {
  const [display, setDisplay] = useState(value);
  useRafLoop(() => {
    setDisplay((prev) => lerp(prev, value, 0.1));
  });
  return round(display);
}
