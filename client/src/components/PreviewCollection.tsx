import { Box } from "@mui/material";
import { map } from "lodash";
import { ReactNode } from "react";

export function PreviewCollection({ preview }: { preview?: ReactNode }) {
  const test = [
    preview,
    <Box
      key="1"
      sx={{
        width: "100%",
        aspectRatio: 1,
        bgcolor: (t) =>
          `color-mix(in srgb, ${t.palette.text.primary} 25%, ${t.palette.background.paper})`,
      }}
    />,
    <Box
      key="2"
      sx={{
        width: "100%",
        aspectRatio: 1,
        bgcolor: (t) =>
          `color-mix(in srgb, ${t.palette.text.primary} 12.5%, ${t.palette.background.paper})`,
      }}
    />,
  ];
  return (
    <Box
      sx={{
        position: "relative",
        aspectRatio: 1,
        mb: 2,
      }}
    >
      {map(test, (item, i) => (
        <Box
          sx={{
            position: "absolute",
            top: `${8 * i ** 0.6}%`,
            transform: `scale(${1 - i * 0.1})`,
            transformOrigin: "bottom",
            borderRadius: 1,
            left: 0,
            overflow: "hidden",
            width: "100%",
            bgcolor: "background.default",
          }}
        >
          {item}
        </Box>
      )).reverse()}
    </Box>
  );
}
