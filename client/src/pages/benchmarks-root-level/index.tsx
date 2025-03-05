import {
  alpha,
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { PreviewCard } from "components/PreviewCard";
import { Analysis } from "components/analysis/Analysis";
import { DataInspectorLayout } from "layout/DataInspectorLayout";
import { GalleryLayout } from "layout/GalleryLayout";
import { head, map, memoize, sum } from "lodash";
import { useBenchmarksData } from "queries/useBenchmarksQuery";
import { ReactNode } from "react";
import { IndexHeader } from "./IndexHeader";
import Table from "./Table";
import { analysisTemplate } from "./analysisTemplate";
import { useAggregateOne } from "queries/useAggregateQuery";
import { formatPercentage } from "utils/format";
import { DownloadBar } from "components/DownloadBar";
import { Tip } from "components/Tip";

const render = memoize((showHeader: boolean) => ({ header, children }) => (
  <>
    {showHeader ? <IndexHeader in={showHeader} /> : header}
    {children}
  </>
));

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
          }}
        >
          {item}
        </Box>
      )).reverse()}
    </Box>
  );
}

export default function Page({ showHeader }: { showHeader?: boolean }) {
  const { data: maps } = useBenchmarksData();
  const instanceCount = sum(map(maps, (m) => m.instances));
  const scenarioCount = sum(map(maps, (m) => m.scens));
  const { data: solved } = useAggregateOne({ filterBy: "solved" });
  const { data: closed } = useAggregateOne({ filterBy: "closed" });
  const theme = useTheme();

  return (
    <GalleryLayout
      root
      title={showHeader ? "Home" : "Benchmarks"}
      description="All maps, scenarios, and instances in the MAPF benchmark dataset"
      path={showHeader ? [] : [{ name: "Home", url: "/" }]}
      render={render(showHeader)}
      items={[
        { label: "Map count", value: maps?.length?.toLocaleString?.() },
        { label: "Instance count", value: instanceCount.toLocaleString() },
        { label: "Scenario count", value: scenarioCount.toLocaleString() },
        {
          label: "Instances solved",
          value: formatPercentage(solved?.result / solved?.all),
        },
        {
          label: "Instances closed",
          value: formatPercentage(closed?.result / solved?.all),
        },
      ]}
      cover={
        <PreviewCollection
          preview={
            <PreviewCard
              map={head(maps)?.id}
              palette={{ obstacle: theme.palette.text.primary }}
              sx={{ width: "100%", height: "auto", aspectRatio: 1 }}
            />
          }
        />
      }
    >
      <Tip
        title={<>Browse MAPF benchmarks</>}
        description={
          <>
            Browse state-of-the-art solutions for grid-based multi-agent
            pathfinding. Analyse trends, compare algorithms, or download the
            dataset for your own use.
          </>
        }
        actions={
          <Button
            sx={{ alignSelf: "flex-start", m: -1, mt: 0 }}
            onClick={() => open("/docs/about", "_blank")}
          >
            See the docs
          </Button>
        }
      />
      <Stack sx={{ gap: 4 }}>
        <DownloadBar />
        <Divider />
        <DataInspectorLayout
          dataTabName="Browse maps"
          data={<Table />}
          analysis={<Analysis template={analysisTemplate} />}
        />
      </Stack>
    </GalleryLayout>
  );
}
