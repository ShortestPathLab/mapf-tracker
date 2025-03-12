import { Box, Stack } from "@mui/material";
import { useXs } from "components/dialog/useSmallDisplay";
import { filter, map, some } from "lodash";
import { Fragment, ReactElement, ReactNode } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { usePrevious } from "react-use";
import { useTransition } from "transition-hook";

export type Route = {
  path: string;
  content: ReactNode;
  parent?: string;
};

function Sheet({
  children,
  in: state = false,
  top = true,
  disableAnimation = false,
}: {
  children?: ReactElement;
  in?: boolean;
  top?: boolean;
  disableAnimation?: boolean;
}) {
  const { stage, shouldMount } = useTransition(state, 300);
  const { stage: topStage } = useTransition(top, 300);
  const active = disableAnimation || topStage === "enter";
  const styles = {
    from: {
      transform: "translateX(16px)",
      opacity: 0,
    },
    enter: {
      "> div": {
        transform: active ? "translateX(0)" : "translateX(-16px)",
        opacity: active ? 1 : 0,
      },
    },
    leave: {
      transform: "translateX(16px)",
      opacity: 0,
    },
  };
  return children ? (
    <Box
      sx={{
        pointerEvents: shouldMount ? "auto" : "none",
        position: "absolute",
        zIndex: (t) => t.zIndex.appBar + 1,
        top: 0,
        left: 0,
        right: 0,
        height: "100dvh",
        ...styles[disableAnimation ? "enter" : stage],
        "&, & > div": {
          overflow: "hidden",
          transition: (t) => t.transitions.create(["transform", "opacity"]),
        },
      }}
    >
      {shouldMount && (
        <Box
          sx={{ width: "100%", height: "100%", bgcolor: "background.default" }}
        >
          {children}
        </Box>
      )}
    </Box>
  ) : null;
}

export function Router({
  routes,
  fallback,
}: {
  routes: Route[];
  fallback?: ReactNode;
}) {
  const { pathname } = useLocation();
  const previous = usePrevious(pathname);
  const sm = useXs();
  const current = routes.find((r) => matchPath(r.path, pathname));
  const previous1 = previous
    ? routes.find((r) => matchPath(r.path, previous))
    : undefined;
  const directMatch = (a?: Route) => matchPath(a.path, pathname);
  const recursiveMatch = (a?: Route) => {
    if (!a) return false;
    if (directMatch(a)) return true;
    const b = filter(routes, (r) => r.parent === a.path);
    if (b) return some(map(b, recursiveMatch));
    return false;
  };
  const createRoute = (
    a: Route,
    child: ReactElement,
    visible: boolean,
    top: boolean,
    root: boolean
  ) =>
    sm ? (
      <Sheet
        in={visible}
        top={top}
        disableAnimation={
          // Disable animation only if navigating between roots
          root && !current?.parent && !previous1?.parent
        }
      >
        {child}
      </Sheet>
    ) : matchPath(a, pathname) ? (
      child
    ) : undefined;
  const matches = routes.filter(recursiveMatch);
  return (
    <Stack
      sx={{
        bgcolor: "background.paper",
        minHeight: "100dvh",
        width: "100%",
        color: "text.primary",
      }}
    >
      {matches.length
        ? routes.map((r) => (
            <Fragment key={r.path}>
              {createRoute(
                r,
                <Box
                  sx={
                    sm
                      ? { height: "100dvh", display: "flex" }
                      : { height: "100dvh", width: "100%", display: "flex" }
                  }
                >
                  {r.content}
                </Box>,
                !!recursiveMatch(r),
                !!directMatch(r),
                !r.parent
              )}
            </Fragment>
          ))
        : fallback}
    </Stack>
  );
}
