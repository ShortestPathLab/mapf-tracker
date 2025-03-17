import { Box, Dialog, useTheme } from "@mui/material";
import { Scroll } from "components/dialog/Scrollbars";
import { useSm } from "components/dialog/useSmallDisplay";
import Show from "components/transitions/Show";
import { ComponentProps, ReactNode } from "react";
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
      open={props.open}
      keepMounted={false}
      TransitionComponent={Show}
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
        ...props.PaperProps,
        sx: {
          maxWidth: width,
          borderRadius: 3,
          background: theme.palette.background.paper,
          overflow: "hidden",
          height: height
            ? height
            : overflow
            ? "100%"
            : contentHeight || "fit-content",
          position: "relative",
          mx: 2,
          marginTop: 0,
          ...props.PaperProps?.sx,
        },
      }}
    >
      {scrollable ? (
        <Scroll
          y
          style={{
            height: "100%",
            width: `min(${width}px, 100%)`,
            maxWidth: width,
          }}
        >
          <Box
            ref={(e: HTMLDivElement) => setContent(e)}
            sx={{ width: "100%", height: sm ? "100%" : undefined }}
          >
            {content}
          </Box>
        </Scroll>
      ) : (
        <Box
          ref={(e: HTMLDivElement) => setContent(e)}
          sx={{
            width: `min(${width}px, 100%)`,
            maxWidth: width,
            height: sm ? "100%" : undefined,
          }}
        >
          {content}
        </Box>
      )}
      {actions}
    </Dialog>
  );
}
