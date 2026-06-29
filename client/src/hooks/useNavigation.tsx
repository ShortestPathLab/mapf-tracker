import {
  entries,
  filter,
  findIndex,
  fromPairs,
  isNaN,
  isNull,
  isUndefined,
  map,
  mapValues,
  startsWith,
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
  createSearchParams,
  Location,
  NavigateOptions,
  useLocation,
  useParams,
  useLocation as useRouterLocation,
  useNavigate as useRouterNavigate,
  useSearchParams,
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
    const currentIndex = location.key && list.length ? findIndex(list, { key: location.key }) : -1;
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
        filter((_, i) => (i ?? 0) <= previousIndex);
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
  return <HistoryContext.Provider value={history}>{children}</HistoryContext.Provider>;
}

export function useHistory() {
  return useContext(HistoryContext);
}

export function useNavigate() {
  const navigate = useRouterNavigate();
  const [, setParams] = useSearchParams();
  return useCallback(
    <T extends object = object, U extends object = object>(
      url: string | number,
      state?: T,
      session?: U & Reason,
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
      navigate(
        {
          pathname: url,
          search: createSearchParams(
            fromPairs(
              filter(items, ([k, v]) => !startsWith(k, "hidden-") && !isUndefined(v) && !isNull(v)),
            ),
          ).toString(),
        },
        {
          state: {
            saved: state,
            session: { "hidden-reason": "unknown", ...session },
          },
        },
      );
    },
    [navigate],
  );
}

export function useLocationState<T extends object = object, U extends object = object>(): T {
  const location: Location<{ saved?: T; session?: U }> = useRouterLocation();
  const [params] = useSearchParams();
  return useMemo(() => {
    // Merges URL search params, saved and session state; callers parameterise
    // by the shape they expect, so the merged result is surfaced as T.
    return {
      ...mapValues(fromPairs(Array.from(params.entries())), (v) => (isNaN(+v) ? v : +v)),
      ...location.state?.saved,
      ...location.state?.session,
    } as T;
  }, [location, params]);
}

export function useLocationStateSeparate<T extends object = object, U extends object = object>() {
  const location: Location<{ saved?: T; session?: U }> = useRouterLocation();
  const [params] = useSearchParams();
  return useMemo(() => {
    return {
      saved: location.state?.saved ?? {},
      params: mapValues(fromPairs(Array.from(params.entries())), (v) => (isNaN(+v) ? v : +v)) ?? {},
      session: location.state?.session ?? {},
    };
  }, [location, params]);
}
