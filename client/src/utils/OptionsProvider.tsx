import { identifier } from "core/config";
import { usePersistentReducer } from "hooks/usePersistentReducer";
import { createContext, useContext } from "react";

const key = `${identifier}.options`;

export type Options = {
  hideTips?: boolean;
  hideSidebar?: boolean;
  sidebarOpenMobile?: boolean;
};

export const storedOptionsValue = localStorage.getItem(key)
  ? JSON.parse(localStorage.getItem(key))
  : { hideTips: false, hideSidebar: false, hideSidebarMobile: false };

export const OptionsContext = createContext<[Options, (o: Options) => void]>([
  storedOptionsValue,
  () => {},
] as [Options, () => void]);

export function useOptions() {
  return useContext(OptionsContext);
}

export function useOptionsState() {
  return usePersistentReducer<typeof key, Options, Options>(
    key,
    (prev, next) => ({ ...prev, ...next }),
    storedOptionsValue
  );
}
