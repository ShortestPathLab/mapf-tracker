import { Box } from "@mui/material";
import { useXs } from "components/dialog/useSmallDisplay";
import { useLocationStateSeparate, useNavigate } from "hooks/useNavigation";
import { PopupState, PopupState as State, usePopupState } from "material-ui-popup-state/hooks";
import { nanoid } from "nanoid";
import { ReactElement, ReactNode, useEffect, useReducer } from "react";
import { usePrevious } from "react-use";
import { FullscreenSurface } from "./FullscreenSurface";
import { ModalAppBar } from "./ModalAppBar";
import { ModalSurface } from "./ModalSurface";
import { PopoverSurface } from "./PopoverSurface";
import { SheetSurface } from "./SheetSurface";
import { SheetTitle } from "./SheetTitle";
import { SlotProps } from "./SlotProps";

export type SurfaceGeneralProps = {
  variant?: "fullscreen" | "sheet" | "modal" | "popover";
  title?: ReactNode;
  children?: ((state: State) => ReactNode) | ReactNode;
  slotProps?: SlotProps;
};

export type SurfaceProps = SurfaceGeneralProps & {
  trigger?: (state: State) => ReactElement;
};

export function useSurfaceHistory(state: PopupState) {
  const navigate = useNavigate();
  const [id, newId] = useReducer(() => `hidden-${nanoid()}`, `hidden-${nanoid()}`);
  const { params, saved, session: _session } = useLocationStateSeparate();
  // Session is a record keyed by the generated surface id; the hook's default
  // return type does not expose an index signature.
  const session = _session as Record<string, number | undefined>;
  const previouslyOpen = usePrevious(state.isOpen);
  // Sync close state
  useEffect(() => {
    if (previouslyOpen && !state.isOpen && session[id]) {
      navigate(-1);
      newId();
    }
  }, [
	session[id],
	state.isOpen,
	previouslyOpen,
	session,
	id,
	navigate
]);
  // Read close state from session
  useEffect(() => {
    if (!session[id]) {
      state.close();
      newId();
    }
  }, [
	session[id],
	session,
	id,
	state
]);
  // Sync open state
  useEffect(() => {
    if (state.isOpen && !previouslyOpen) {
      navigate(location.pathname, { ...params, ...saved }, { ...session, [id]: 1 });
    }
  }, [
	state.isOpen,
	previouslyOpen,
	navigate,
	saved,
	session,
	id,
	params
]);
}

export function Surface(props: SurfaceProps) {
  const state = usePopupState({ variant: "dialog" });
  useSurfaceHistory(state);
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
  const children = typeof _children === "function" ? _children(state) : _children;
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
  return <>{<SurfaceVariant {...{ slotProps, state, children: childrenVariant }} />}</>;
}
