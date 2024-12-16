import {
  entries,
  filter,
  find,
  isNaN,
  isUndefined,
  map,
  mapValues,
} from "lodash";
import { useCallback, useMemo } from "react";
import {
  Location,
  useLocation,
  useLocation as useRouterLocation,
  useNavigate as useRouterNavigate,
} from "react-router-dom";
import { useList } from "react-use";
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
export function useHistory<T extends object, U extends object>() {
  type State = {
    saved: T;
    session: U & Reason;
  };
  const location = useLocation() as Location<State>;

  const [list, { removeAt, push }] = useList<Location<State>>([]);

  // Has side effects
  return useMemo(() => {
    if (location.key && list.length && find(list, { key: location.key })) {
      // Went back
      removeAt(list.length - 1);
      return { location, history: list, action: "back" };
    } else {
      // Went forward
      push(location);
      return { location, history: list, action: "forward" };
    }
  }, [location.key]);
}

export function useNavigate() {
  const navigate = useRouterNavigate();
  return useCallback(
    <T extends object = object, U extends object = object>(
      url: string | -1,
      state?: T,
      session?: U & Reason
    ) => {
      if (url === -1) {
        navigate(-1);
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
