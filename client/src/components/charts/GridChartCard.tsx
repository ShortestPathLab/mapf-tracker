import { ExpandContentRounded } from "@mui-symbols-material/w400";
import {
  Box,
  IconButton,
  Stack,
  StackProps,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { Item } from "components/Item";
import { useXs } from "components/dialog/useSmallDisplay";
import { useSurface } from "components/surface/useSurface";
import { ComponentProps, ReactNode } from "react";
import { useCss } from "react-use";
import Size from "react-virtualized-auto-sizer";
import { paper } from "theme";

function FullScreenCard({ primary, label }: ChartCardProps) {
  const xs = useXs();
  return (
    <Stack
      sx={{ height: `calc(100dvh - ${xs ? 56 + 16 * 2 : 64 + 24 * 2}px)` }}
    >
      <Stack sx={{ pb: 4 }}>{label}</Stack>
      <Stack
        sx={{
          flex: 1,
        }}
      >
        <Size>
          {({ width, height }) => (
            <Stack sx={{ width, height }}>{primary}</Stack>
          )}
        </Size>
      </Stack>
    </Stack>
  );
}

type ChartCardProps = {
  label?: ReactNode;
  extras?: ReactNode;
  primary?: ReactNode;
};

function ChartCard({
  label,
  extras,
  primary,
  ...props
}: ChartCardProps & StackProps) {
  const finePointer = useMediaQuery("(pointer: fine)");
  const { dialog, open } = useSurface(FullScreenCard, {
    title: "Chart details",
    variant: "fullscreen",
  });
  const cls = useCss({});
  return (
    <Stack
      {...props}
      sx={{
        [`& .${cls}`]: { opacity: finePointer ? 0 : 1 },
        [`&:hover .${cls}`]: { opacity: 1 },
        ...paper(1),
        ...props.sx,
      }}
    >
      <Stack sx={{ p: 2, gap: 2, height: "100%", flex: 1 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
          {label}
          <Stack direction="row" sx={{ alignItems: "flex-start" }}>
            {extras}
            <Tooltip title="Enlarge">
              <IconButton
                className={cls}
                onClick={() => open({ label, extras, primary })}
                sx={{ mr: -1, mt: -1 }}
              >
                <ExpandContentRounded />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Box sx={{ flex: 1 }}>
          <Size>
            {({ width, height }) => (
              <Stack sx={{ width, height }}>{primary}</Stack>
            )}
          </Size>
        </Box>
      </Stack>
      {dialog}
    </Stack>
  );
}
export const GridChartCard = ({
  columns,
  height,
  primaryLabel,
  secondaryLabel,
  extras,
  content,
  ...props
}: {
  columns?: number;
  height?: string | number;
  primaryLabel?: string;
  secondaryLabel?: string;
  extras?: ReactNode;
  content?: ReactNode;
} & Omit<ComponentProps<typeof ChartCard>, "content">) => (
  <ChartCard
    label={
      <Item disableMargin primary={primaryLabel} secondary={secondaryLabel} />
    }
    extras={extras}
    primary={content}
    {...props}
    sx={{ gridColumn: `span ${columns}`, height, ...props.sx }}
  />
);
