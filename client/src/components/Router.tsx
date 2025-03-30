import { Box, Stack } from "@mui/material";
import { useXs } from "components/dialog/useSmallDisplay";
import { filter, find, head, map, some } from "lodash";
import { Fragment, ReactElement, ReactNode, useEffect, useState } from "react";
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
  direction,
  disableAnimation = false,
}: {
  children?: ReactNode;
  in?: boolean;
  direction?: "forwards" | "backwards";
  disableAnimation?: boolean;
}) {
  const [inner, setInner] = useState(false);
  useEffect(() => void setInner(state), [state]);

  const { stage, shouldMount } = useTransition(inner, 300);
  const active = shouldMount || disableAnimation;
  const styles = {
    from: {
      transform:
        direction === "forwards" ? "translateX(16px)" : "translateX(-16px)",
      opacity: 0,
    },
    enter: {
      "> div": {
        transform: "translateX(0)",
        opacity: 1,
      },
    },
    leave: {
      transform:
        direction === "forwards" ? "translateX(16px)" : "translateX(-16px)",
      opacity: 0,
    },
  };
  return children ? (
    <Box
      sx={{
        pointerEvents: active ? "auto" : "none",
        position: "absolute",
        zIndex: (t) => t.zIndex.appBar + 1,
        top: 0,
        left: 0,
        right: 0,
        height: "100dvh",
        ...styles[disableAnimation ? "enter" : stage],
        "&, & > div": {
          overflow: "hidden",
          transition: (t) =>
            t.transitions.create(["transform", "opacity"], { duration: 450 }),
        },
      }}
    >
      {active && (
        <Box
          sx={{
            width: "100%",
            height: "100dvh",
            bgcolor: "background.default",
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  ) : null;
}

export function Router({
  flat,
  routes,
  fallback: _fallback,
}: {
  flat?: boolean;
  routes: Route[];
  fallback?: ReactNode | true;
}) {
  const fallback =
    _fallback === true
      ? head(routes)
      : {
          content: _fallback,
          path: "",
        };

  const { pathname } = useLocation();
  const previous = usePrevious(pathname);
  const sm = useXs();
  const current = routes.find((r) => matchPath(r.path, pathname));
  const prev = previous
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

  const depth = (a?: Route) =>
    a?.parent ? depth(find(routes, (x) => x.path === a.parent)) + 1 : 0;

  const isRoot = (a?: Route) => !a?.parent;

  const [animationState, setAnimationState] = useState<{
    previous?: Route;
    next?: Route;
    direction?: "forwards" | "backwards";
  }>({
    previous: undefined,
    next: undefined,
    direction: undefined,
  });
  useEffect(() => {
    if (prev === current) return;
    const betweenRoots = isRoot(prev) && isRoot(current);
    const direction = depth(prev) > depth(current) ? "backwards" : "forwards";
    setAnimationState({
      previous: prev,
      next: current,
      direction: betweenRoots ? undefined : direction,
    });
  }, [prev, current]);
  const createRoute = (a: Route, child: ReactElement) => {
    return directMatch(a) ? (
      flat ? (
        child
      ) : (
        <Stack
          sx={{
            bgcolor: "background.default",
            width: "100%",
            height: "100dvh",
          }}
        >
          <Stack
            sx={{
              m: 0.5,
              boxShadow: (t) => t.shadows[1],
              width: (t) => `calc(100% - ${t.spacing(1)})`,
              height: (t) => `calc(100dvh - ${t.spacing(1)})`,
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            {child}
          </Stack>
        </Stack>
      )
    ) : undefined;
  };
  const matches = routes.filter(recursiveMatch);
  return (
    <Stack
      sx={{
        bgcolor: "background.paper",
        minHeight: "100dvh",
        height: "100%",
        width: "100%",
        color: "text.primary",
      }}
    >
      {!sm
        ? matches.length
          ? routes.map((r) => (
              <Fragment key={r.path}>
                {createRoute(
                  r,
                  <Box sx={{ height: "100%", width: "100%", display: "flex" }}>
                    {r.content}
                  </Box>
                )}
              </Fragment>
            ))
          : fallback.content
        : matches.length
        ? animationState.direction
          ? animationState.direction === "forwards"
            ? [
                <Sheet
                  direction="backwards"
                  key={animationState.previous?.path}
                >
                  {animationState.previous?.content}
                </Sheet>,
                <Sheet in direction="forwards" key={animationState.next?.path}>
                  {animationState.next?.content}
                </Sheet>,
              ]
            : [
                <Sheet in direction="backwards" key={animationState.next?.path}>
                  {animationState.next?.content}
                </Sheet>,
                <Sheet direction="forwards" key={animationState.previous?.path}>
                  {animationState.previous?.content}
                </Sheet>,
              ]
          : [
              <Sheet key={animationState.previous?.path} />,
              <Sheet
                disableAnimation
                in
                direction="forwards"
                key={animationState.next?.path}
              >
                {animationState.next?.content}
              </Sheet>,
            ]
        : [
            <Sheet direction="forwards" in disableAnimation key={fallback.path}>
              {fallback.content}
            </Sheet>,
          ]}
    </Stack>
  );
}
