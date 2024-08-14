import { Dialog } from "components/dialog";
import { merge } from "lodash";
import { nanoid } from "nanoid";
import { ComponentProps, ReactNode, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useLocationState, useNavigate } from "./useNavigation";

export type DialogContentProps = {
  onClose?: () => void;
  onProps?: (p: ComponentProps<typeof Dialog>) => void;
};
const pathname = () => new URL(location.href).pathname;
export function useDialog<T>(
  C?: (props: T & DialogContentProps) => ReactNode,
  props?: ComponentProps<typeof Dialog>
) {
  const key = useMemo(() => nanoid(), []);
  const navigate = useNavigate();
  const b = useLocationState();
  // const [isOpen, setOpen] = useState(false);
  const isOpen = !!b[key];
  const [state, setState] = useState<T & DialogContentProps>();
  const [modalProps, setModalProps] = useState<ComponentProps<typeof Dialog>>(
    {}
  );
  const open = (s?: T & DialogContentProps) => {
    setState(s ?? ({} as any));
    // setOpen(true);
    navigate(pathname(), {}, { ...b, [key]: true });
  };
  const close = () => {
    // setOpen(false);
    navigate(pathname(), {}, { ...b, [key]: false });
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
