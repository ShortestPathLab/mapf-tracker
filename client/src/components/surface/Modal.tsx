import { Box, Dialog, useTheme } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { ComponentProps, ReactNode } from "react";
import { Scroll } from "components/dialog/Scrollbars";
import Swipe from "./Swipe";
import { useCache } from "./useCache";
import { useModalOverflow } from "./useModalOverflow";

export type ModalProps = {
  children?: ReactNode;
  actions?: ReactNode;
  width?: string | number;
  height?: string | number;
  variant?: "default" | "submodal";
  scrollable?: boolean;
};

export function Modal({
  children,
  actions,
  width = 480,
  height,
  variant = "default",
  scrollable = true,
  ...props
}: ModalProps & ComponentProps<typeof Dialog>) {
  const theme = useTheme();
  const sm = useSm();

  const content = useCache<ReactNode | undefined>(children);

  const depth = 1;
  const mt = 95 - 5 * depth;

  const {
    overflow,
    contentHeight,
    setModal: setTarget,
    setContent,
  } = useModalOverflow(height);

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
      sx={{
        ...(useVariant && {
          paddingTop: theme.spacing(8),
        }),
        ...props.sx,
      }}
      PaperProps={{
        ref: (e: HTMLElement | null) => setTarget(e),
        sx: {
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
              : overflow
              ? "100%"
              : contentHeight || "fit-content",
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
        style={{
          height: "100%",
          width: sm ? undefined : width,
          maxWidth: "100%",
          overflow: scrollable ? undefined : "hidden",
        }}
      >
        <Box
          ref={(e: HTMLDivElement) => setContent(e)}
          sx={{ width: "100%", height: sm ? "100%" : undefined }}
        >
          {content}
        </Box>
      </Scroll>
      {actions}
    </Dialog>
  );
}
