import { Box, Typography, TypographyProps } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { useTop } from "layout/TabBar";
import { useRef } from "react";

export function StickyTitle({ children, ...props }: TypographyProps) {
  const sm = useSm();
  const ref = useRef<HTMLElement>(null);
  const isTop = useTop(ref);
  return (
    <Box
      ref={ref}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (t) => t.zIndex.fab - 1,
        py: 2,
        my: -2,
        px: 3,
        mx: -3,
        bgcolor: isTop ? "background.paper" : "background.default",
      }}
    >
      <Typography
        variant={sm ? "subtitle2" : "subtitle1"}
        color="text.secondary"
        {...props}
      >
        {children}
      </Typography>
    </Box>
  );
}
