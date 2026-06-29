import { ExpandContentRounded, HelpRounded } from "@mui-symbols-material/w300";
import { Box, IconButton, Stack, StackProps, Tooltip, useMediaQuery } from "@mui/material";
import { Item } from "components/Item";
import { useXs } from "components/dialog/useSmallDisplay";
import { useSurface } from "components/surface/useSurface";
import { ComponentProps, ReactNode } from "react";
import { useCss } from "react-use";
import Size from "react-virtualized-auto-sizer";
import { paper } from "theme";
import { Prose } from "layout";

function FullScreenCard({ primary, label }: ChartCardProps) {
  const xs = useXs();
  return (
    <Stack sx={{ height: `calc(100dvh - ${xs ? 56 + 16 * 2 : 64 + 24 * 2}px)` }}>
      <Stack sx={{ pb: 2 }}>{label}</Stack>
      <Stack
        sx={{
          flex: 1,
        }}
      >
        <Size>{({ width, height }) => <Stack sx={{ width, height }}>{primary}</Stack>}</Size>
      </Stack>
    </Stack>
  );
}

function DocumentationDialog({ documentation }: { documentation: ReactNode }) {
  return <Prose>{documentation}</Prose>;
}

type ChartCardProps = {
  label?: ReactNode;
  extras?: ReactNode;
  primary?: ReactNode;
  documentation?: ReactNode;
};

function ChartCard({
  label,
  extras,
  primary,
  documentation,
  ...props
}: ChartCardProps & StackProps) {
  const finePointer = useMediaQuery("(pointer: fine)");
  const { dialog, open } = useSurface(FullScreenCard, {
    title: "Chart details",
    variant: "fullscreen",
  });
  const { dialog: docDialog, open: openDoc } = useSurface(DocumentationDialog, {
    title: "Chart info",
  });
  const cls = useCss({});
  return (
    <Stack
      {...props}
      sx={{
        [`& .${cls}`]: { opacity: finePointer ? 0 : 1 },
        [`&:hover .${cls}`]: { opacity: 1 },
        ...paper(1, false),
        ...props.sx,
      }}
    >
      <Stack sx={{ p: 2, gap: 2, height: "100%", flex: 1 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
          {label}
          <Stack direction="row" sx={{ alignItems: "flex-start", gap: 1 }}>
            {extras}
            {documentation && (
              <Tooltip title="Documentation">
                <IconButton
                  className={cls}
                  onClick={() => openDoc({ documentation })}
                  sx={{ mr: -1, mt: -1 }}
                >
                  <HelpRounded />
                </IconButton>
              </Tooltip>
            )}
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
          <Size>{({ width, height }) => <Stack sx={{ width, height }}>{primary}</Stack>}</Size>
        </Box>
      </Stack>
      {dialog}
      {docDialog}
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
  documentation,
  ...props
}: {
  columns?: number;
  height?: string | number;
  primaryLabel?: string;
  secondaryLabel?: string;
  extras?: ReactNode;
  content?: ReactNode;
  documentation?: ReactNode;
} & Omit<ComponentProps<typeof ChartCard>, "content">) => (
  <ChartCard
    label={<Item disableMargin primary={primaryLabel} secondary={secondaryLabel} />}
    extras={extras}
    primary={content}
    documentation={documentation}
    {...props}
    sx={{ gridColumn: `span ${columns}`, height, ...props.sx }}
  />
);
