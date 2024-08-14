import { Stack } from "@mui/material";
import Enter from "components/dialog/Enter";
import { useMd } from "components/dialog/useSmallDisplay";
import { ReactNode } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { filter, map, some } from "lodash";

export type Route = {
  path: string;
  content: ReactNode;
  parent?: string;
};
export function Router({
  routes,
  fallback,
}: {
  routes: Route[];
  fallback?: ReactNode;
}) {
  const { pathname } = useLocation();
  const md = useMd();
  const recursiveMatch = (a?: Route) => {
    if (!a) return false;
    if (matchPath(a.path, pathname)) return true;
    const b = filter(routes, (r) => r.parent === a.path);
    if (b) return some(map(b, recursiveMatch));
    return false;
  };
  const createRoute = (a: Route, child: ReactNode) =>
    md ? (
      <Enter backdrop mountOnEnter unmountOnExit in={recursiveMatch(a)}>
        {child}
      </Enter>
    ) : matchPath(a, pathname) ? (
      child
    ) : undefined;
  return (
    <Stack
      sx={{
        bgcolor: "background.default",
        minHeight: "100dvh",
        color: "text.primary",
      }}
    >
      {some(routes.map((r) => matchPath(r.path, pathname)))
        ? routes.map((r) => createRoute(r, r.content))
        : fallback}
    </Stack>
  );
}
