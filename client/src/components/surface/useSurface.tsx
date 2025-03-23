import { useLocationState, useNavigate } from "hooks/useNavigation";
import { merge } from "lodash";
import { usePopupState } from "material-ui-popup-state/hooks";
import { nanoid } from "nanoid";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { SurfaceBase, SurfaceBaseProps, SurfaceProps } from "./Surface";
export type SurfaceContentProps = {
  onClose?: () => void;
  onProps?: (p: SurfaceProps) => void;
};
export function useSurface<T>(
  Content?: (props: T & SurfaceContentProps) => ReactNode,
  props: SurfaceProps = {}
) {
  const [id, setId] = useState(nanoid());
  const locationState = useLocationState();
  const navigate = useNavigate();
  const popupState = usePopupState({ variant: "dialog" });
  const [state, setState] = useState<T & SurfaceContentProps>();
  const [modalProps, setModalProps] = useState<Partial<SurfaceBaseProps>>({});
  const open = (s?: T & SurfaceContentProps) => {
    popupState.open();
    navigate(location.pathname, undefined, { ...locationState, [id]: 1 });
    setState(s);
  };
  const close = useCallback(() => {
    popupState.close();
    setModalProps({});
  }, []);
  useEffect(() => {
    if (!locationState[id]) {
      close();
      setId(nanoid());
    }
  }, [locationState[id]]);
  return {
    open,
    close,
    dialog: (
      <SurfaceBase {...merge({ state: popupState }, props, modalProps)}>
        {Content && (
          <Content
            {...state!}
            onClose={() => {
              close?.();
              state?.onClose?.();
            }}
            onProps={setModalProps}
          />
        )}
      </SurfaceBase>
    ),
  };
}
