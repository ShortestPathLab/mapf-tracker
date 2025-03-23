import { DownloadRounded } from "@mui-symbols-material/w400";
import { Button, Stack } from "@mui/material";
import { Tip } from "components/Tip";
import { Analysis } from "components/analysis/Analysis";
import { useSurface } from "components/surface";
import { DataInspectorLayout } from "layout/DataInspectorLayout";
import { GalleryLayout } from "layout/GalleryLayout";
import { map, memoize, sum } from "lodash";
import { DownloadOptions } from "pages/benchmarks-map-level/DownloadOptions";
import { useAggregateOne } from "queries/useAggregateQuery";
import { useBenchmarksData } from "queries/useBenchmarksQuery";
import { formatPercentage } from "utils/format";
import { IndexHeader } from "./IndexHeader";
import Table from "./Table";
import { analysisTemplate, compareTemplate } from "./analysisTemplate";
import References from "./references.md";
import Description from "./description.md";
import { Prose } from "layout";

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
        {
          label: "References",
          value: (
            <Prose sx={{ mt: "-1em" }}>
              <References />
            </Prose>
          ),
        },
      ]}
      actions={{
        options: [
          {
            label: "Bulk export",
            action: () => openDialog(),
            icon: <DownloadRounded />,
            primary: true,
          },
        ],
      }}
    >
      <Tip
        title={<>Browse MAPF benchmarks</>}
        description={
          <>
            <Prose
              sx={{ fontSize: (t) => t.typography.body2.fontSize, my: -2 }}
            >
              <Description />
            </Prose>
          </>
        }
        actions={
          <Button onClick={() => open("/docs/about", "_blank")}>
            See the docs
          </Button>
        }
      />
      <Stack sx={{ gap: 4 }}>
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
