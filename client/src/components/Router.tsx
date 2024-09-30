import { Box, Stack } from "@mui/material";
import Enter from "components/dialog/Enter";
import { useMd } from "components/dialog/useSmallDisplay";
import { filter, map, some } from "lodash";
import { ReactNode } from "react";
import { matchPath, useLocation } from "react-router-dom";

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
    md && a.parent ? (
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
        ? routes.map((r) =>
            createRoute(
              r,
              <Box
                sx={
                  md
                    ? {
                        position: "absolute",
                        zIndex: (t) => t.zIndex.appBar + 1,
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: "background.default",
                      }
                    : { height: "100dvh", width: "100%" }
                }
              >
                {r.content}
              </Box>
            )
          )
        : fallback}
    </Stack>
  );
}
