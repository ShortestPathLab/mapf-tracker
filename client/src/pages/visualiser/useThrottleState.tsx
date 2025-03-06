import { useState } from "react";
import { useThrottle } from "react-use";

export function useThrottleState<T>(ms?: number) {
  const [state, setState] = useState<T>();
  const throttleState = useThrottle(state, ms ?? 1000 / 15);
  return [throttleState, setState] as const;
}
