import { Box, BoxProps, useTheme } from "@mui/material";
import { useXs } from "components/dialog/useSmallDisplay";
import { ReactNode } from "react";

export function Floating({
  children,
  always,
  ...props
}: {
  children?: ReactNode;
  always?: boolean;
} & BoxProps) {
  const xs = useXs();
  const { spacing, zIndex } = useTheme();
  const floating = xs || always;
  return (
    <>
      <Box
        {...props}
        sx={{
          visibility: floating ? "visible" : "hidden",
          zIndex: zIndex.modal + 1,
          position: "fixed",
          bottom: spacing(2),
          left: spacing(2),
          right: spacing(2),
          width: "auto",
          ...props.sx,
        }}
      >
        {children}
      </Box>
      <Box
        {...props}
        sx={{
          visibility: floating ? "hidden" : "visible",
          display: "flex",
          ...props.sx,
        }}
      >
        {children}
      </Box>
    </>
  );
}
