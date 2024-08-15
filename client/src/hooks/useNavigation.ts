import { entries, isInteger, isNaN, map, mapValues, startsWith } from "lodash";
import { useCallback, useMemo } from "react";
import {
  Location,
  useLocation as useRouterLocation,
  generatePath,
  useNavigate as useRouterNavigate,
} from "react-router-dom";
function isValidHttpUrl(string: string) {
  let url: URL;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}
export function useNavigate() {
  const navigate = useRouterNavigate();
  return useCallback(
    <T extends {} = {}, U extends {} = {}>(
      url: string,
      state?: T,
      session?: U
    ) => {
      if (isValidHttpUrl(url)) {
        open(url);
        return;
      }
      const items = entries(state);
      navigate(
        items.length
          ? `${url}?${map(items, ([k, v]) => `${k}=${v}`).join("&")}`
          : url,
        { state: { saved: state, session } }
      );
    },
    [navigate]
  );
}

export function useLocationState<T extends {} = {}, U extends {} = {}>() {
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
