import { useLocationState } from "hooks/useNavigation";
import { useState } from "react";

export function useStableLocationState<T extends object>() {
  const state = useLocationState<T>();
  const [cache] = useState(state);
  return cache;
}
