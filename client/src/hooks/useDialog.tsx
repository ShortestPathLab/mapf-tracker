import { Dialog } from "components/dialog";
import { merge } from "lodash";
import { ComponentProps, ReactNode, useState } from "react";

export type DialogContentProps = {
  onClose?: () => void;
  onProps?: (p: ComponentProps<typeof Dialog>) => void;
};

export function useDialog<T>(
  C?: (props: T & DialogContentProps) => ReactNode,
  props?: ComponentProps<typeof Dialog>
) {
  const [isOpen, setOpen] = useState(false);
  // const isOpen = !!b[key];
  const [state, setState] = useState<T & DialogContentProps>();
  const [modalProps, setModalProps] = useState<ComponentProps<typeof Dialog>>(
    {}
  );
  const open = (s?: T & DialogContentProps) => {
    setState(s ?? ({} as T));
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    setModalProps({});
  };
  return {
    open,
    close,
    dialog: (
      <Dialog
        {...merge<
          ComponentProps<typeof Dialog>,
          ComponentProps<typeof Dialog>,
          ComponentProps<typeof Dialog>
        >(
          { slotProps: { modal: { open: isOpen, onClose: close } } },
          props,
          modalProps
        )}
      >
        <C
          {...state}
          onClose={() => {
            close?.();
            state?.onClose?.();
          }}
          onProps={setModalProps}
        />
      </Dialog>
    ),
  };
}
