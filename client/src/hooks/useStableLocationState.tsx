import {
  useLocationState,
  useLocationStateSeparate,
} from "hooks/useNavigation";
import { useMemo, useState } from "react";
import { usePreviousDistinct } from "react-use";
import { isEqual } from "lodash";

export function useStableLocationState<T extends object>() {
  const state = useLocationState<T>();
  const previous = usePreviousDistinct<typeof state>(state, isEqual);
  const cache = useMemo(
    () => ({
      ...previous,
      ...state,
    }),
    [JSON.stringify(state), JSON.stringify(previous)],
  );
  return cache;
}

export function useStableLocationStateSeparate<T extends object>() {
  const state = useLocationStateSeparate<T>();
  const previous = usePreviousDistinct<typeof state>(state, isEqual);
  const cache = useMemo(
    () => ({
      ...previous,
      ...state,
    }),
    [JSON.stringify(state), JSON.stringify(previous)],
  );
  return cache;
}
