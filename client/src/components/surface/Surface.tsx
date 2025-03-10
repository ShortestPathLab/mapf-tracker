import { useSm } from "components/dialog/useSmallDisplay";
import {
  PopupState as State,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { ReactElement, ReactNode } from "react";
import { DrawerSurface as SheetSurface } from "./DrawerSurface";
import { DrawerTitle } from "./DrawerTitle";
import { ModalAppBar } from "./ModalAppBar";
import { PopoverSurface } from "./PopoverSurface";
import { SlotProps } from "./SlotProps";
import { Box } from "@mui/material";

export type SurfaceGeneralProps = {
  variant?: "sheet" | "modal" | "popover" | "drawer";
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
  const children =
    typeof _children === "function" ? _children(state) : _children;
  const SurfaceVariant = {
    sheet: SheetSurface,
    modal: SheetSurface,
    popover: PopoverSurface,
  }[variant];

  const childrenVariant = {
    sheet: (
      <>
        <DrawerTitle onClose={state?.close}>{title}</DrawerTitle>
        <Box sx={{ p: 2 }}>{children}</Box>
      </>
    ),
    modal: (
      <>
        <ModalAppBar onClose={state?.close} {...slotProps?.appBar}>
          {title}
        </ModalAppBar>
        {children}
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
