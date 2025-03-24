import { ReactNode } from "react";
import { SlotProps } from "./SlotProps";
import { PopupState as State, bindDialog } from "material-ui-popup-state/hooks";
import { Modal } from "./Modal";

export function FullscreenSurface({
  state,
  slotProps,
  children,
}: {
  state: State;
  children: ReactNode;
  slotProps?: Pick<SlotProps, "modal" | "paper" | "scroll">;
}) {
  return (
    <Modal
      {...bindDialog(state)}
      fullScreen
      width="100dvw"
      scrollable={false}
      {...slotProps?.modal}
      PaperProps={{
        ...slotProps?.paper,
        sx: {
          borderRadius: 0,
          width: " 100dvw",
          height: "100dvh",
          mx: 0,
          ...slotProps?.paper?.sx,
        },
      }}
    >
      {children}
    </Modal>
  );
}
