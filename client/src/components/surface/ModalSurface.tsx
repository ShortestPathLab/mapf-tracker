import { ReactNode } from "react";
import { SlotProps } from "./SlotProps";
import { PopupState as State, bindDialog } from "material-ui-popup-state/hooks";
import { Modal } from "./Modal";

export function ModalSurface({
  state,
  slotProps,
  children,
}: {
  state: State;
  children: ReactNode;
  slotProps?: Pick<SlotProps, "modal" | "paper" | "scroll">;
}) {
  return (
    <Modal {...bindDialog(state)} {...slotProps?.modal}>
      {children}
    </Modal>
  );
}
