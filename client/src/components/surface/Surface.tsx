import { Box } from "@mui/material";
import { useXs } from "components/dialog/useSmallDisplay";
import {
  PopupState as State,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { ReactElement, ReactNode } from "react";
import { ModalAppBar } from "./ModalAppBar";
import { ModalSurface } from "./ModalSurface";
import { PopoverSurface } from "./PopoverSurface";
import { SheetSurface } from "./SheetSurface";
import { SheetTitle } from "./SheetTitle";
import { SlotProps } from "./SlotProps";
import { FullscreenSurface } from "./FullscreenSurface";

export type SurfaceGeneralProps = {
  variant?: "fullscreen" | "sheet" | "modal" | "popover" | "drawer";
  title?: ReactNode;
  children?: ((state: State) => ReactNode) | ReactNode;
  slotProps?: SlotProps;
};

export type SurfaceProps = SurfaceGeneralProps & {
  trigger?: (state: State) => ReactElement;
};

export function Surface(props: SurfaceProps) {
  const state = usePopupState({ variant: "dialog" });
  return (
    <>
      {props.trigger?.(state)}
      <SurfaceBase {...props} state={state} />
    </>
  );
}

export type SurfaceBaseProps = SurfaceGeneralProps & { state: State };

export function SurfaceBase({
  title,
  children: _children,
  slotProps,
  state,
  variant = "sheet",
}: SurfaceBaseProps) {
  const xs = useXs();
  const children =
    typeof _children === "function" ? _children(state) : _children;
  const SurfaceVariant = {
    fullscreen: FullscreenSurface,
    sheet: SheetSurface,
    modal: ModalSurface,
    popover: PopoverSurface,
  }[variant];

  const childrenVariant = {
    sheet: (
      <>
        <SheetTitle onClose={state?.close}>{title}</SheetTitle>
        <Box sx={{ p: xs ? 2 : 3 }}>{children}</Box>
      </>
    ),
    modal: (
      <Box sx={{ p: xs ? 1 : 0 }}>
        <ModalAppBar onClose={state?.close} {...slotProps?.appBar}>
          {title}
        </ModalAppBar>
        <Box sx={{ p: xs ? 2 : 3 }}>{children}</Box>
      </Box>
    ),
    fullscreen: (
      <>
        <ModalAppBar onClose={state?.close} {...slotProps?.appBar}>
          {title}
        </ModalAppBar>
        <Box sx={{ p: xs ? 2 : 3 }}>{children}</Box>
      </>
    ),
    popover: children,
  }[variant];
  return (
    <>
      {<SurfaceVariant {...{ slotProps, state, children: childrenVariant }} />}
    </>
  );
}
