import { Button, Stack, useTheme } from "@mui/material";
import { ActionBar } from "components/ActionBar";
import { PreviewCard } from "components/PreviewCard";
import { Tip } from "components/Tip";
import { Analysis } from "components/analysis/Analysis";
import { DataInspectorLayout } from "layout/DataInspectorLayout";
import { GalleryLayout } from "layout/GalleryLayout";
import { head, map, memoize, sum } from "lodash";
import { useAggregateOne } from "queries/useAggregateQuery";
import { useBenchmarksData } from "queries/useBenchmarksQuery";
import { formatPercentage } from "utils/format";
import { PreviewCollection } from "../../components/PreviewCollection";
import { IndexHeader } from "./IndexHeader";
import Table from "./Table";
import { analysisTemplate, compareTemplate } from "./analysisTemplate";
import { useSurface } from "components/surface";
import { DownloadRounded } from "@mui-symbols-material/w400";
import { DownloadOptions } from "pages/benchmarks-map-level/DownloadOptions";

const render = memoize((showHeader: boolean) => ({ header, children }) => (
  <>
    {showHeader ? <IndexHeader in={showHeader} /> : header}
    {children}
  </>
));

export default function Page({ showHeader }: { showHeader?: boolean }) {
  const { open: openDialog, dialog } = useSurface(DownloadOptions, {
    title: "Bulk export",
  });

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
        <ActionBar
          options={[
            {
              label: "Bulk export",
              action: () => openDialog(),
              icon: <DownloadRounded />,
              primary: true,
            },
          ]}
        />
        <DataInspectorLayout
          dataTabName="Browse maps"
          data={<Table />}
          analysis={<Analysis template={analysisTemplate} />}
          compare={<Analysis template={compareTemplate} />}
        />
      </Stack>
      {dialog}
    </GalleryLayout>
  );
}
