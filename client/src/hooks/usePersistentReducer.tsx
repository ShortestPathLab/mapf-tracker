import { Reducer, useReducer } from "react";
import { useEffect } from "react";

export function usePersistentReducer<Key extends string, Action, State>(
  key: Key,
  reducer: Reducer<State, Action>,
  initialState: State
): [State, Action] {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : init;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, dispatch as Action];
}
