import { Box, CircularProgress, Divider, Link, Stack, Tooltip } from "@mui/material";
import { GridChartCard } from "components/charts/GridChartCard";
import { useSm } from "components/dialog/useSmallDisplay";
import { GalleryLayout } from "layout/GalleryLayout";
import { AlgorithmByMapChart } from "pages/benchmarks-root-level/charts/AlgorithmByMapChart";
import { AlgorithmByMapTypeChart } from "pages/benchmarks-root-level/charts/AlgorithmByMapTypeChart";
import { SuboptimalityByAgentCountChart } from "components/charts/SuboptimalityByAgentCountChart";

import { TableRounded } from "@mui-symbols-material/w300";
import { Title } from "components/StickyTitle";
import { useSurface } from "components/surface";
import { AlgorithmDownloadOptions } from "pages/benchmarks-map-level/AlgorithmDownloadOptions";
import { useAlgorithmDetailData } from "queries/useAlgorithmQuery";
import { matchPath, redirect } from "react-router-dom";
import { AlgorithmPreview } from "./AlgorithmPreview";
import { Table } from "./Table";
import { inferOptimality } from "./inferOptimality";
import { Item } from "components/Item";
import { isUndefined } from "lodash";
import { useAggregateOne } from "queries/useAggregateQuery";
import { formatDate, formatPercentage } from "utils/format";
import { ItemGrid } from "components/ItemGrid";
import AlgorithmByMapTypeDoc from "docs/charts/AlgorithmByMapType.md";
import AlgorithmByMapDoc from "docs/charts/AlgorithmByMap.md";
import SuboptimalityByAgentCountDoc from "docs/charts/SuboptimalityByAgentCount.md";

export function AlgorithmPage() {
  const sm = useSm();
  const { params } = matchPath("/submissions/:id", window.location.pathname) ?? {};

  const { data } = useAlgorithmDetailData(params?.id);
  const { data: general } = useAggregateOne({});

  const { open, dialog } = useSurface(AlgorithmDownloadOptions, {
    title: `${data ? data?.algo_name : "--"} - Export claims`,
    variant: "fullscreen",
  });
  if (!params?.id) redirect("/");

  return (
    <GalleryLayout
      cover={<AlgorithmPreview id={data?.id} sx={{ width: 40, height: 40 }} />}
      title={data?.algo_name}
      description={data?.authors}
      path={[
        { name: "Home", url: "/" },
        { name: "Submissions", url: "/submissions" },
      ]}
      items={[
        ...(
          [
            { key: "github", label: "Repository" },
            { key: "dblp", label: "DBLP" },
            { key: "google_scholar", label: "Google Scholar" },
          ] as const
        )
          .filter(({ key }) => !!data?.[key])
          .map(({ key, label }) => ({
            value: <Link href={data?.[key]}>{data?.[key]?.replace("https://", "")}</Link>,
            label,
          })),
        { value: data?.papers, label: "Papers" },
        {
          value: data && inferOptimality(data) ? "Optimal" : "Suboptimal",
          label: "Optimality",
        },
        { value: data?.comments, label: "Comments" },
        {
          label: "Submitted at",
          value: data?.submittedAt ? formatDate(data?.submittedAt) : undefined,
        },
        { label: "Submitted by", value: data?.requesterName },
      ]}
      actions={{
        options: [
          {
            action: () => open({ algorithm: params?.id }),
            icon: <TableRounded />,
            label: "Export claims",
            primary: true,
          },
        ],
      }}
    >
      <Divider />
      <ItemGrid
        items={[
          { value: data?.instances_solved, label: "Instances solved" },
          { value: data?.instances_closed, label: "Instances closed" },
          { value: data?.best_solution, label: "Best solution" },
          { value: data?.best_lower, label: "Best lower-bound" },
        ].map(({ value, label }) => {
          const displayValue = isUndefined(value) ? "--" : value.toLocaleString();
          const percentage = (value ?? 0) / (general?.all ?? 1);
          const color = percentage < 1 ? "info.main" : "success.main";
          return (
            <>
              <Item key={label} primary={displayValue} secondary={label} invert></Item>
              <Tooltip title={`${label}: ${displayValue} (${formatPercentage(percentage)})`}>
                <Box
                  sx={{
                    display: "grid",
                    grid: "1fr / 1fr",
                    "> *": {
                      gridArea: "1 / 1",
                    },
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    size={24}
                    sx={{ color: "text.secondary", opacity: 0.3 }}
                    value={100}
                  />
                  <CircularProgress
                    size={24}
                    sx={{ color }}
                    variant="determinate"
                    value={100 * percentage}
                  />
                </Box>
              </Tooltip>
            </>
          );
        })}
        width={230}
      />
      <Title sticky>Algorithm performance</Title>
      <Stack sx={{ gap: 2 }}>
        <GridChartCard
          primaryLabel="Completion by domain"
          secondaryLabel="Instances closed and solved across domains"
          height={560}
          documentation={<AlgorithmByMapTypeDoc />}
          content={!!data?.id && <AlgorithmByMapTypeChart algorithm={data?.id} />}
        />
        <GridChartCard
          primaryLabel="Completion by map"
          secondaryLabel="Instances closed and solved across maps"
          height={560}
          documentation={<AlgorithmByMapDoc />}
          content={!!data?.id && <AlgorithmByMapChart algorithm={data?.id} />}
        />
        <GridChartCard
          primaryLabel="Suboptimality by agent count"
          secondaryLabel="Suboptimality range across agent counts"
          height={560}
          documentation={<SuboptimalityByAgentCountDoc />}
          content={!!data?.id && <SuboptimalityByAgentCountChart algorithm={data?.id} />}
        />
      </Stack>
      <Title sticky>Submitted instances</Title>
      <Stack sx={{ mx: sm ? -2 : 0 }}>
        <Table algorithm={data?.id} />
      </Stack>
      {dialog}
    </GalleryLayout>
  );
}
