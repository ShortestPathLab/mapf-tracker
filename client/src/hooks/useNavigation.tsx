import {
  entries,
  filter,
  findIndex,
  isNaN,
  isUndefined,
  map,
  mapValues,
} from "lodash";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Location,
  useLocation,
  useLocation as useRouterLocation,
  useNavigate as useRouterNavigate,
} from "react-router-dom";
import { useList, usePreviousDistinct } from "react-use";
function isValidHttpUrl(string: string) {
  let url: URL;
  try {
    url = new URL(string);
  } catch {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

type Reason = {
  reason?: "top" | "appbar" | "unknown" | "navigation" | "modal";
};
/**
 * Minimalistic history implementation.
 */
export function useHistoryProvider<T extends object, U extends object>() {
  type State = {
    saved: T;
    session: U & Reason;
  };
  const location = useLocation() as Location<State>;
  const previous = usePreviousDistinct(location);

  const [list, { push, filter }] = useList<Location<State>>([]);

  const [out, setOut] = useState({
    location,
    history: list,
    index: -1,
    action: "forward",
    canGoBack: false,
    canForward: false,
  });

  // Has side effects
  useEffect(() => {
    const currentIndex =
      location.key && list.length ? findIndex(list, { key: location.key }) : -1;
    if (currentIndex !== -1) {
      // Went back
      setOut({
        location,
        history: list,
        index: currentIndex,
        action: "back",
        canForward: currentIndex < list.length - 1,
        canGoBack: currentIndex > 0,
      });
    } else {
      const previousIndex = findIndex(list, { key: previous?.key });
      if (previous?.key !== location.key && previousIndex !== -1) {
        filter((_, i) => i <= previousIndex);
      }
      // Went to new page
      push(location);
      setOut({
        location,
        index: -1,
        history: list,
        canGoBack: list.length > 0,
        action: "forward",
        canForward: false,
      });
    }
  }, [previous?.key, location.key, push]);

  console.log(out);
  return out;
}

export const HistoryContext = createContext<{
  history: Location[];
  location: Location | undefined;
  index: number;
  action: string;
  canGoBack: boolean;
  canForward: boolean;
}>({
  location: undefined,
  history: [],
  index: -1,
  action: "none",
  canGoBack: false,
  canForward: false,
});

export function HistoryProvider({ children }: { children: ReactNode }) {
  const history = useHistoryProvider();
  return (
    <HistoryContext.Provider value={history}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  return useContext(HistoryContext);
}

export function useNavigate() {
  const navigate = useRouterNavigate();
  return useCallback(
    <T extends object = object, U extends object = object>(
      url: string | number,
      state?: T,
      session?: U & Reason
    ) => {
      if (typeof url === "number") {
        navigate(url);
        return;
      }
      if (isValidHttpUrl(url)) {
        open(url);
        return;
      }
      const items = entries(state);
      const a = {
        state: { saved: state, session: { reason: "unknown", ...session } },
      };
      navigate(
        items.length
          ? `${url}?${map(
              filter(items, ([, v]) => !isUndefined(v)),
              ([k, v]) => `${k}=${v}`
            ).join("&")}`
          : url,
        a
      );
    },
    [navigate]
  );
}

export function useLocationState<
  T extends object = object,
  U extends object = object
>() {
  const location: Location<{ saved?: T; session?: U }> = useRouterLocation();
  return useMemo(() => {
    const params = Object.fromEntries(new URLSearchParams(location.search));
    return {
      ...mapValues(params, (v) => (isNaN(+v) ? v : +v)),
      ...location.state?.saved,
      ...location.state?.session,
    };
  }, [location]);
}
