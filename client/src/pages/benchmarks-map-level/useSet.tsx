import { every, isEqual, some } from "lodash";
import { MouseEvent, TouchEvent, useMemo } from "react";
import { useList } from "react-use";

export function useSet<T>(initial?: T[]) {
  const [state, set] = useList(initial);
  const index = useMemo(() => new Set(state), [state]);
  const ops = {
    value: state,
    ...set,
    count: state.length,
    has: (t: T) => index.has(t),
    add: (...xs: T[]) => xs.forEach((x) => set.upsert(isEqual, x)),
    remove: (...xs: T[]) => set.filter((x) => !xs.includes(x)),
    toggle: (v: boolean, ...xs: T[]) =>
      v ? ops.add(...xs) : ops.remove(...xs),
    bindToggle: (...xs: T[]) => {
      const checked = {
        every: every(xs, (x) => ops.has(x)),
        some: some(xs, (x) => ops.has(x)),
      };
      return {
        checked: checked.every,
        indeterminate: checked.some && !checked.every,
        onMouseDown: (e: MouseEvent<unknown>) => e.stopPropagation(),
        onTouchStart: (e: TouchEvent<unknown>) => e.stopPropagation(),
        onClick: (e: MouseEvent<unknown>) => e.stopPropagation(),
        onChange: (_: unknown, v: boolean) => ops.toggle(v, ...xs),
      };
    },
  };
  return ops;
}
