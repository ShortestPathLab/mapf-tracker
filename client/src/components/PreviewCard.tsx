import {
  Box,
  Fade,
  Skeleton,
  SkeletonProps,
  Stack,
  StackProps,
  useTheme,
} from "@mui/material";
import { PreviewOptions, usePreviewData } from "queries/usePreviewQuery";
import { useMemo } from "react";
import { colors } from "utils/colors";

function rotate<T>(list: T[]) {
  let i = 0;
  return () => list[i++ % list.length];
}

export function PreviewCard({
  palette,
  scenario,
  map,
  instance,
  ...props
}: { palette?: { [K in string]: string } } & PreviewOptions &
  StackProps &
  SkeletonProps) {
  const { data, isLoading } = usePreviewData({ scenario, map, instance });
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const p = {
    background: palette?.background ?? theme.palette.background.paper,
    obstacle: palette?.obstacle ?? theme.palette.divider,
  };
  const b64Image = useMemo(() => {
    if (!data) return;
    const getColor = rotate(colors);
    return btoa(
      data
        .replace(/var\(--background\)/g, p.background)
        .replace(/var\(--obstacle\)/g, p.obstacle)
        .replace(/var\(--agent\)/g, () => getColor()[dark ? "300" : "A400"])
    );
  }, [data, theme, dark, p.background, p.obstacle]);
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gridTemplateRows: "1fr",
        width: 48,
        height: 48,
        ...props.sx,
      }}
    >
      <Fade in={isLoading}>
        <Skeleton
          variant="rounded"
          {...props}
          sx={{
            gridArea: "1/1",
            width: "100%",
            height: "100%",
          }}
        />
      </Fade>
      <Fade in={!isLoading}>
        <Stack
          {...props}
          sx={{
            gridArea: "1/1",
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            border: (t) => `1px solid ${t.palette.divider}`,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            backgroundPosition: "center",
            borderRadius: 1,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundImage: `url("data:image/svg+xml;base64,${b64Image}")`,
          }}
        />
      </Fade>
    </Box>
  );
}
