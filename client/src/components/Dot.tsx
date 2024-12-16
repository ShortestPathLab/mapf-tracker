import { Box, BoxProps } from "@mui/material";

export function Dot({ sx, ...props }: BoxProps) {
  return (
    <Box
      {...props}
      sx={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: 1,
        mr: 1,
        verticalAlign: "middle",
        mb: 0.25,
        ...sx,
      }}
    />
  );
}
