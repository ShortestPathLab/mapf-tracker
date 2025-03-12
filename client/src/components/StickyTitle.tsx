import { Box, Typography, TypographyProps } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { useTop } from "layout/TabBar";
import { useRef } from "react";

export function Title({
  children,
  sticky,
  ...props
}: { sticky?: boolean } & TypographyProps) {
  const sm = useSm();
  const ref = useRef<HTMLElement>(null);
  const isTop = useTop(ref);
  return (
    <Box
      ref={ref}
      sx={{
        py: 2,
        my: -2,
        px: 3,
        mx: -3,
        ...(sticky && {
          position: "sticky",
          top: 0,
          zIndex: (t) => t.zIndex.fab - 1,
          bgcolor: isTop ? "background.paper" : "background.default",
        }),
      }}
    >
      <Typography variant={sm ? "subtitle1" : "h6"} {...props}>
        {children}
      </Typography>
    </Box>
  );
}
