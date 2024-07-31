import { entries, isInteger, isNaN, map, mapValues } from "lodash";
import { useCallback, useMemo } from "react";
import {
  Location,
  useLocation as useRouterLocation,
  generatePath,
  useNavigate as useRouterNavigate,
} from "react-router-dom";

export function useNavigate() {
  const navigate = useRouterNavigate();
  return useCallback(
    <T extends {}>(url: string, state?: T) => {
      const items = entries(state);
      navigate(
        items.length
          ? `${url}?${map(items, ([k, v]) => `${k}=${v}`).join("&")}`
          : url,
        { state }
      );
    },
    [navigate]
  );
}

export function useLocationState<T extends {}>() {
  const location: Location<T> = useRouterLocation();
  return useMemo(() => {
    const params = Object.fromEntries(new URLSearchParams(location.search));
    return {
      ...mapValues(params, (v) => (isNaN(+v) ? v : +v)),
      ...location.state,
    };
  }, [location]);
}
