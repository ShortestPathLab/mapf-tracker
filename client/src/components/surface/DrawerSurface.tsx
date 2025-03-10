import {
  Box,
  ModalProps,
  PaperProps,
  Stack,
  StackProps,
  SwipeableDrawer,
  useTheme,
} from "@mui/material";
import { Scroll } from "components/dialog/Scrollbars";
import { merge, noop } from "lodash-es";
import { PopupState as State, bindDialog } from "material-ui-popup-state/hooks";
import { ReactNode, createContext } from "react";
import { useMeasure } from "react-use";
import { SlotProps } from "./SlotProps";
import { stopPropagation } from "./stopPropagation";
import { useDrawerHandle } from "./useDrawerHandle";

import { forwardRef } from "react";

const Handle = forwardRef<HTMLDivElement, StackProps>((props, ref) => (
  <Stack
    ref={ref}
    sx={{
      height: 32,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      cursor: "grab",
      "&:active": { cursor: "grabbing" },
      "&:hover > div": { opacity: 0.54 },
    }}
    {...props}
  >
    <Box
      sx={{
        mx: "auto",
        minWidth: 32,
        minHeight: 4,
        width: 32,
        height: 4,
        borderRadius: 1,
        bgcolor: "action.active",
        opacity: (t) => t.palette.action.disabledOpacity,
        my: 2,
      }}
    />
  </Stack>
));

export default Handle;

export const SurfaceSizeContext = createContext<{
  width: number | string;
  height: number | string;
} | null>(null);

export function DrawerSurface({
  state,
  slotProps,
  children,
}: {
  state: State;
  children: ReactNode;
  slotProps?: Pick<SlotProps, "drawer" | "paper" | "scroll">;
}) {
  const maxDepth = state.isOpen ? 1 : 0;
  const depth = state.isOpen ? 1 : 0;

  // ─── Measurements ────────────────────────────────────────────────────

  const gap = slotProps?.drawer?.gap ?? depth * 16 + 16;
  const ratio = (maxDepth - depth) / maxDepth;

  // ─────────────────────────────────────────────────────────────────────

  const theme = useTheme();
  const { setHandle, setPaper, setScroll } = useDrawerHandle(state.close);
  const [ref, { width }] = useMeasure();
  const maxHeight = `calc(100dvh - ${gap + 32}px)`;

  return (
    <SwipeableDrawer
      transitionDuration={{ enter: 500, exit: 500 }}
      SlideProps={{
        mountOnEnter: true,
        easing: {
          enter: theme.transitions.easing.easeOut,
          exit: theme.transitions.easing.easeOut,
        },
      }}
      anchor="bottom"
      disableSwipeToOpen
      disableDiscovery
      onOpen={noop}
      {...bindDialog(state)}
      {...merge(
        {
          ModalProps: {
            keepMounted: false,
            sx: {
              transition: (t) =>
                t.transitions.create("transform", {
                  duration: 500,
                  easing: t.transitions.easing.easeOut,
                }),
              transform: `translateY(${-32 * ratio}px) scale(${
                1 - ratio * 0.025
              })`,
            },
          } as ModalProps,
        },
        { BackdropProps: { sx: { transform: "scale(2)" } } },
        {
          PaperProps: {
            ref: setPaper,
            sx: {
              overflow: "hidden",
              maxWidth: "min(640px, 100%)",
              mx: "auto",
              "--Paper-overlay": "none !important",
              bgcolor: "background.default",
              backgroundImage: "none",
              borderTopLeftRadius: (t) => t.shape.borderRadius * 3.5,
              borderTopRightRadius: (t) => t.shape.borderRadius * 3.5,
              maxHeight: `calc(100dvh - ${gap}px)`,
              boxShadow: (t) =>
                `0 ${t.spacing(4)} 0px 0px ${t.palette.background.paper} `,
            },
          } as PaperProps,
        },
        { PaperProps: slotProps?.paper },
        slotProps?.drawer
      )}
    >
      <Handle ref={setHandle} />
      <Box onTouchStart={stopPropagation} ref={ref}>
        <Scroll
          y
          px={0}
          style={{ maxHeight }}
          ref={setScroll}
          {...slotProps?.scroll}
        >
          <SurfaceSizeContext.Provider value={{ width, height: maxHeight }}>
            {children}
          </SurfaceSizeContext.Provider>
        </Scroll>
      </Box>
    </SwipeableDrawer>
  );
}
