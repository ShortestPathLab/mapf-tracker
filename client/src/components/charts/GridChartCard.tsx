import { ExpandContentRounded } from "@mui-symbols-material/w400";
import { Box, IconButton, Stack, StackProps, Tooltip } from "@mui/material";
import { Item } from "components/Item";
import { useXs } from "components/dialog/useSmallDisplay";
import { useDialog } from "hooks/useDialog";
import { ComponentProps, ReactNode } from "react";
import { useCss } from "react-use";
import Size from "react-virtualized-auto-sizer";
import { paper } from "theme";

function FullScreenCard({ primary, label }: ChartCardProps) {
  const xs = useXs();
  return (
    <Stack sx={{ height: `calc(100dvh - ${xs ? 56 : 64}px)` }}>
      <Stack sx={{ px: xs ? 2 : 3, pt: 1, pb: 0 }}>{label}</Stack>
      <Stack
        sx={{
          flex: 1,
          p: xs ? 2 : 3,
        }}
      >
        {primary}
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
  const { dialog, open } = useDialog(FullScreenCard, {
    title: "Chart details",
    slotProps: {
      modal: {
        variant: "default",
        fullScreen: true,
        scrollable: false,
        width: "100vw",
      },
    },
  });
  const cls = useCss({});
  return (
    <Stack
      {...props}
      sx={{
        [`& .${cls}`]: { opacity: 0 },
        [`&:hover .${cls}`]: { opacity: 1 },
        ...paper(0),
        ...props.sx,
      }}
    >
      <Stack sx={{ p: 2, gap: 2, height: "100%", flex: 1 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
          {label}
          <Stack direction="row" sx={{ alignItems: "flex-start" }}>
            {extras}
            <Tooltip title="Show details">
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
