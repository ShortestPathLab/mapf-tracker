import { ArrowBackRounded } from "@mui-symbols-material/w400";
import {
  alpha,
  AppBar,
  Box,
  BoxProps,
  Button,
  ButtonProps,
  Dialog,
  Fade,
  IconButton,
  Popover,
  PopoverProps,
  Stack,
  SwipeableDrawer,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { ResizeSensor } from "css-element-queries";
import PopupState, { bindPopover } from "material-ui-popup-state";
import { useScrollState } from "./useScrollState";
import { useSm } from "./useSmallDisplay";

import { DialogContentProps } from "hooks/useDialog";
import { useModalDepth } from "hooks/useModalProviderValue";
import { delay, merge } from "lodash";
import { PopupState as State } from "material-ui-popup-state/hooks";
import {
  ComponentProps,
  CSSProperties,
  ReactNode,
  SyntheticEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { paper, useAcrylic, usePaper } from "theme";
import { Scroll } from "./Scrollbars";
import Show from "components/transitions/Show";
import Swipe from "components/transitions/Swipe";

export function AppBarTitle({ children }: { children?: ReactNode }) {
  return (
    <Typography component="div" variant="h6">
      {children}
    </Typography>
  );
}

export type Props = {
  children?: ReactNode;
  actions?: ReactNode;
  width?: string | number;
  height?: string | number;
  variant?: "default" | "submodal" | "drawer";
  scrollable?: boolean;
};

type ModalAppBarProps = {
  onClose?: () => void;
  style?: CSSProperties;
  elevatedStyle?: CSSProperties;
  transitionProperties?: string[];
  children?: ReactNode;
  elevatedChildren?: ReactNode;
  simple?: boolean;
  position?: "fixed" | "absolute" | "sticky" | "static";
};

export function ModalAppBar({
  onClose = () => {},
  children,
  elevatedChildren,
  position = "sticky",
}: ModalAppBarProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const [, , isAbsoluteTop, , setTarget] = useScrollState();
  useEffect(() => {
    if (ref.current) {
      const panel = ref.current.closest(
        ".scrollbars div[data-overlayscrollbars-contents]"
      );
      if (panel && panel instanceof HTMLDivElement) setTarget(panel);
    }
  }, [ref.current]);

  function renderTitle(label: ReactNode) {
    return typeof label === "string" ? (
      <AppBarTitle>{label}</AppBarTitle>
    ) : (
      label
    );
  }

  return (
    <AppBar
      ref={ref}
      elevation={0}
      position={position}
      style={{
        pointerEvents: "none",
        color: theme.palette.text.primary,
        background: "transparent",
      }}
    >
      <Toolbar
        sx={
          isAbsoluteTop
            ? {}
            : {
                ...paper(),
                background: alpha(theme.palette.background.paper, 0.8),
                border: "none",
                borderRadius: 0,
                boxShadow: "none",
                borderBottom: (t) => `1px solid ${t.palette.divider}`,
              }
        }
      >
        <IconButton
          style={{
            marginRight: theme.spacing(1),
            pointerEvents: "all",
          }}
          aria-label="open drawer"
          edge="start"
          onClick={() => onClose()}
        >
          <ArrowBackRounded />
        </IconButton>

        {children && (
          <div
            style={{
              gridColumn: 1,
              gridRow: 1,
              flex: 1,
              overflow: "auto",
            }}
          >
            <Fade
              in={!!(!elevatedChildren || isAbsoluteTop)}
              mountOnEnter
              unmountOnExit
            >
              <Box style={{ width: "100%" }}>{renderTitle(children)}</Box>
            </Fade>
          </div>
        )}
        {elevatedChildren && (
          <div
            style={{
              gridColumn: 1,
              gridRow: 1,
              flex: 1,
              overflow: "auto",
            }}
          >
            <Fade
              in={!!(elevatedChildren && !isAbsoluteTop)}
              mountOnEnter
              unmountOnExit
            >
              <Box style={{ width: "100%" }}>
                {renderTitle(elevatedChildren)}
              </Box>
            </Fade>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
}

const unsavedChangesHintText = "Unsaved changes will be permanently lost.";

export function ConfirmDialog({
  onClose,
  onAccept,
  hintText = unsavedChangesHintText,
  closeLabel = "Continue editing",
  acceptLabel = "Close without saving",
  acceptColor = "error",
  acceptProps,
}: DialogContentProps & {
  onAccept?: () => void;
  hintText?: ReactNode;
  closeLabel?: ReactNode;
  acceptLabel?: ReactNode;
  acceptColor?: string;
  acceptProps?: ButtonProps;
}) {
  return (
    <Stack gap={4}>
      <Typography
        color="text.secondary"
        sx={{ mt: -1, whiteSpace: "pre-line" }}
      >
        {hintText}
      </Typography>
      <Stack direction="row" sx={{ gap: 2, justifyContent: "flex-end" }}>
        <Button onClick={() => onClose?.()} color="inherit">
          {closeLabel}
        </Button>
        <Button
          onClick={() => onAccept?.()}
          variant="contained"
          color={acceptColor}
          sx={{ px: 2, py: 1 }}
          {...acceptProps}
        >
          {acceptLabel}
        </Button>
      </Stack>
    </Stack>
  );
}

export default function Modal({
  children,
  actions,
  width = 480,
  height,
  variant = "drawer",
  scrollable = true,
  ...props
}: Props & ComponentProps<typeof Dialog>) {
  const [content, setContent] = useState<ReactNode | undefined>(undefined);
  useLayoutEffect(() => {
    if (children) setContent(children);
  }, [children]);
  const theme = useTheme();
  const sm = useSm();
  const globalDepth = useModalDepth();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [contentRef, setContentRef] = useState<HTMLElement | null>(null);
  const [hasOverflowingChildren, setHasOverflowingChildren] = useState(false);
  const [childHeight, setChildHeight] = useState(0);
  const [depth, setDepth] = useState(1);
  useEffect(() => {
    if (!props.open || !globalDepth) return;
    setDepth(globalDepth.current);
    globalDepth.current++;
    return () => {
      globalDepth.current--;
    };
  }, [globalDepth, setDepth, props.open]);

  const mt = props.fullScreen ? 100 : 95 - 5 * depth;

  useLayoutEffect(() => {
    if (!(target && contentRef && !sm && !height)) {
      return;
    }
    const callback = () => {
      const doesOverflow = window.innerHeight - 64 < contentRef.offsetHeight;
      setHasOverflowingChildren(doesOverflow);
      setChildHeight(
        contentRef.offsetHeight <= 1 ? 0 : Math.ceil(contentRef.offsetHeight)
      );
    };
    window.addEventListener("resize", callback);
    const ob = new ResizeSensor(contentRef, callback);
    callback();
    return () => {
      window.removeEventListener("resize", callback);
      ob.detach();
    };
  }, [target, contentRef, sm, height]);

  const useVariant = variant === "submodal" && sm;

  return sm || variant !== "drawer" ? (
    <Dialog
      fullScreen={sm}
      {...props}
      open={sm ? props.open && !!depth : props.open}
      keepMounted={false}
      TransitionComponent={sm ? Swipe : Show}
      TransitionProps={{
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        ...(sm && {
          timeout: theme.transitions.duration.standard * 2,
        }),
        unmountOnExit: true,
        mountOnEnter: true,
      }}
      style={{
        ...(useVariant && {
          paddingTop: theme.spacing(8),
        }),
        ...props.style,
      }}
      PaperProps={{
        ref: (e: HTMLElement | null) => setTarget(e),
        ...props.PaperProps,
        style: {
          ...(sm && {
            borderRadius: `${theme.shape.borderRadius * 2}px ${
              theme.shape.borderRadius * 2
            }px 0 0`,
          }),
          background: theme.palette.background.paper,
          overflow: "hidden",
          height:
            height && !sm
              ? height
              : sm
              ? `${mt}dvh`
              : hasOverflowingChildren
              ? "100%"
              : childHeight || "fit-content",
          position: "relative",
          maxWidth: "none",
          marginTop: sm ? `${100 - mt}dvh` : 0,
          ...props.PaperProps?.style,
        },
      }}
    >
      <Scroll
        y={scrollable ? true : false}
        px={sm ? 7 : 8}
        style={{
          height: "100%",
          width: sm ? undefined : width,
          maxWidth: "100%",
          overflow: scrollable ? undefined : "hidden",
        }}
      >
        <div
          ref={(e) => setContentRef(e)}
          style={{
            width: "100%",
            height: sm ? "100%" : undefined,
          }}
        >
          {content}
        </div>
      </Scroll>
      {actions}
    </Dialog>
  ) : (
    <SwipeableDrawer
      disableSwipeToOpen
      SlideProps={{ mountOnEnter: true, unmountOnExit: true }}
      keepMounted={false}
      anchor="right"
      open={props.open}
      onClose={() => props.onClose?.({}, "backdropClick")}
      onOpen={() => {}}
    >
      <Scroll
        y
        style={{
          backgroundColor: theme.palette.background.paper,
          height: "100%",
          minWidth: 320,
          maxWidth: `min(90vw, ${width}px)`,
          overflow: scrollable ? undefined : "hidden",
        }}
      >
        <div
          ref={(e) => setContentRef(e)}
          style={{
            width: "100%",
            height: sm ? "100%" : undefined,
          }}
        >
          {content}
        </div>
      </Scroll>
    </SwipeableDrawer>
  );
}

export function ManagedModal({
  padded,
  title,
  appBar: ModalAppBarProps,
  trigger = () => <></>,
  children,
  popover,
  slotProps,
  preventClose,
  showTitleInPopover,
}: {
  preventClose?: boolean;
  padded?: boolean;
  title?: string;
  options?: ComponentProps<typeof Modal>;
  trigger?: (
    onClick: (e: SyntheticEvent<Element, Event>) => void,
    isOpen: boolean
  ) => ReactNode;
  appBar?: ModalAppBarProps;
  children?: ((state: State) => ReactNode) | ReactNode;
  popover?: boolean;
  showTitleInPopover?: boolean;
  slotProps?: {
    popover?: Partial<PopoverProps>;
    paper?: Partial<BoxProps>;
    modal?: Partial<ComponentProps<typeof Modal>>;
  };
}) {
  const { transitions } = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const paper = usePaper();
  const acrylic = useAcrylic();
  const sm = useSm();
  const shouldDisplayPopover = popover && !sm;
  const chi = children ?? slotProps?.modal?.children;
  useEffect(() => {
    if (!preventClose) return;
    const f = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return unsavedChangesHintText;
    };
    window.addEventListener("beforeunload", f);
    return () => {
      window.removeEventListener("beforeunload", f);
    };
  }, [preventClose]);
  return (
    <PopupState variant="popover">
      {(state) => {
        const { open, close: close1, isOpen } = state;
        const close = (force?: boolean) => {
          if (force || !preventClose) {
            close1();
            slotProps?.modal?.onClose?.({}, "backdropClick");
          } else {
            setConfirmOpen(true);
          }
        };
        const chi2 = typeof chi === "function" ? chi(state) : chi;
        return (
          <>
            {trigger(open, isOpen)}
            {shouldDisplayPopover ? (
              <Popover
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                }}
                {...merge(
                  bindPopover(state),
                  {
                    slotProps: {
                      paper: {
                        sx: {
                          ...acrylic,
                        },
                      },
                    },
                  },
                  slotProps?.popover
                )}
              >
                <Box
                  {...merge(
                    { sx: { width: 360, ...acrylic, ...paper(1) } },
                    slotProps?.paper
                  )}
                >
                  {!!title && showTitleInPopover && (
                    <ModalAppBar
                      onClose={() => close()}
                      {...(title
                        ? { children: <AppBarTitle>{title}</AppBarTitle> }
                        : ModalAppBarProps)}
                    />
                  )}
                  {chi2}
                </Box>
              </Popover>
            ) : (
              <Modal
                open={isOpen}
                {...slotProps?.modal}
                onClose={() => close()}
              >
                <ModalAppBar
                  onClose={() => close()}
                  {...(title
                    ? { children: <AppBarTitle>{title}</AppBarTitle> }
                    : ModalAppBarProps)}
                />
                {padded ? <Box sx={{ p: sm ? 2 : 3 }}>{chi2}</Box> : chi2}
              </Modal>
            )}
            <Modal
              variant="default"
              open={confirmOpen}
              onClose={() => setConfirmOpen(false)}
            >
              <ModalAppBar onClose={() => setConfirmOpen(false)}>
                <AppBarTitle>Close with unsaved changes?</AppBarTitle>
              </ModalAppBar>
              <Box sx={{ p: sm ? 2 : 3 }}>
                <ConfirmDialog
                  onClose={() => setConfirmOpen(false)}
                  onAccept={() => {
                    setConfirmOpen(false);
                    delay(() => close(true), transitions.duration.shortest);
                  }}
                />
              </Box>
            </Modal>
          </>
        );
      }}
    </PopupState>
  );
}

export type ManagedModalProps = ComponentProps<typeof ManagedModal>;
