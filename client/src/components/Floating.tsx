import { Box, useTheme } from "@mui/material";
import { useXs } from "components/dialog/useSmallDisplay";
import { ReactNode } from "react";

export function Floating({
  children,
  always,
}: {
  children?: ReactNode;
  always?: boolean;
}) {
  const xs = useXs();
  const { spacing, zIndex } = useTheme();
  const floating = xs || always;
  return (
    <>
      <Box
        sx={{
          visibility: floating ? "visible" : "hidden",
          zIndex: zIndex.modal + 1,
          position: "fixed",
          bottom: spacing(2),
          left: spacing(2),
          right: spacing(2),
          width: "auto",
        }}
      >
        {children}
      </Box>
      <Box
        sx={{ visibility: floating ? "hidden" : "visible", display: "flex" }}
      >
        {children}
      </Box>
    </>
  );
}
