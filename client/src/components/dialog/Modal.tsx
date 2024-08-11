import { ArrowBack } from "@mui/icons-material";
import {
  alpha,
  AppBar,
  Box,
  BoxProps,
  Dialog,
  Fade,
  IconButton,
  Popover,
  PopoverProps,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { ResizeSensor } from "css-element-queries";
import PopupState, { bindPopover } from "material-ui-popup-state";
import { useScrollState } from "./useScrollState";
import { useSm } from "./useSmallDisplay";

import { merge } from "lodash";
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
import Swipe from "./Swipe";

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
  variant?: "default" | "submodal";
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
  style,
  elevatedStyle,
  children,
  transitionProperties = ["box-shadow", "background", "border-bottom"],
  elevatedChildren,
  simple,
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
          }}
          aria-label="open drawer"
          edge="start"
          onClick={() => onClose()}
        >
          <ArrowBack />
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

export default function Modal({
  children,
  actions,
  width = 480,
  height,
  variant = "default",
  scrollable = true,
  ...props
}: Props & ComponentProps<typeof Dialog>) {
  const [content, setContent] = useState<ReactNode | undefined>(undefined);
  useLayoutEffect(() => {
    if (children) setContent(children);
  }, [children]);
  const theme = useTheme();
  const sm = useSm();

  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [contentRef, setContentRef] = useState<HTMLElement | null>(null);
  const [hasOverflowingChildren, setHasOverflowingChildren] = useState(false);
  const [childHeight, setChildHeight] = useState(0);
  const depth = 1;

  const mt = 95 - 5 * depth;

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

  return (
    <Dialog
      fullScreen={sm}
      {...props}
      open={sm ? props.open && !!depth : props.open}
      keepMounted={false}
      TransitionComponent={sm ? Swipe : undefined}
      TransitionProps={{
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
        ...props.PaperProps,
      }}
    >
      <Scroll
        y
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
}: {
  padded?: boolean;
  title?: string;
  options?: ComponentProps<typeof Modal>;
  trigger?: (
    onClick: (e: SyntheticEvent<any, Event>) => void,
    isOpen: boolean
  ) => ReactNode;
  appBar?: ModalAppBarProps;
  children?: ((state: State) => ReactNode) | ReactNode;
  popover?: boolean;
  slotProps?: {
    popover?: Partial<PopoverProps>;
    paper?: Partial<BoxProps>;
    modal?: Partial<ComponentProps<typeof Modal>>;
  };
}) {
  const paper = usePaper();
  const acrylic = useAcrylic();
  const sm = useSm();
  const shouldDisplayPopover = popover && !sm;
  const chi = children ?? slotProps?.modal?.children;
  return (
    <PopupState variant="popover">
      {(state) => {
        const { open, close, isOpen } = state;
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
                  {!!title && (
                    <ModalAppBar
                      onClose={close}
                      {...(title
                        ? { children: <AppBarTitle>{title}</AppBarTitle> }
                        : ModalAppBarProps)}
                    />
                  )}
                  {chi2}
                </Box>
              </Popover>
            ) : (
              <Modal open={isOpen} onClose={close} {...slotProps?.modal}>
                <ModalAppBar
                  onClose={close}
                  {...(title
                    ? { children: <AppBarTitle>{title}</AppBarTitle> }
                    : ModalAppBarProps)}
                />
                {padded ? <Box sx={{ p: sm ? 2 : 3 }}>{chi2}</Box> : chi2}
              </Modal>
            )}
          </>
        );
      }}
    </PopupState>
  );
}

export type ManagedModalProps = ComponentProps<typeof ManagedModal>;
