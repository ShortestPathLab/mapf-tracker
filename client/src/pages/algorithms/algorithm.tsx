import { Divider, Link, Stack } from "@mui/material";
import { GridChartCard } from "components/charts/GridChartCard";
import { useSm } from "components/dialog/useSmallDisplay";
import { GalleryLayout } from "layout/GalleryLayout";
import { AlgorithmByMapChart } from "pages/benchmarks-root-level/charts/AlgorithmByMapChart";
import { AlgorithmByMapTypeChart } from "pages/benchmarks-root-level/charts/AlgorithmByMapTypeChart";

import { TableRounded } from "@mui-symbols-material/w400";
import { Title } from "components/StickyTitle";
import { useSurface } from "components/surface";
import { AlgorithmDownloadOptions } from "pages/benchmarks-map-level/AlgorithmDownloadOptions";
import { useAlgorithmDetailData } from "queries/useAlgorithmQuery";
import { matchPath, redirect } from "react-router-dom";
import { AlgorithmPreview } from "./AlgorithmPreview";
import { Table } from "./Table";
import { inferOptimality } from "./inferOptimality";

export function AlgorithmPage() {
  const sm = useSm();
  const { params } =
    matchPath("/submissions/:id", window.location.pathname) ?? {};

  const { data } = useAlgorithmDetailData(params?.id);

  const { open, dialog } = useSurface(AlgorithmDownloadOptions, {
    title: `${data ? data?.algo_name : "--"} - Export instances`,
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
        ...(data?.github
          ? [
              {
                value: <Link href={data.github}>{data.github}</Link>,
                label: "GitHub",
              },
            ]
          : []),
        { value: data?.papers, label: "Papers" },
        {
          value: data && inferOptimality(data) ? "Optimal" : "Suboptimal",
          label: "Optimality",
        },
        { value: data?.instances_solved, label: "Instances solved" },
        { value: data?.instances_closed, label: "Instances closed" },
        { value: data?.best_solution, label: "Best solution" },
        { value: data?.best_lower, label: "Best lower-bound" },
        { value: data?.comments, label: "Comments" },
      ]}
      actions={{
        options: [
          {
            action: () => open({ algorithm: params?.id }),
            icon: <TableRounded />,
            label: "Export instances",
            primary: true,
          },
        ],
      }}
    >
      <Divider />
      <Title sticky>Algorithm performance</Title>
      <Stack sx={{ gap: 2 }}>
        <GridChartCard
          primaryLabel="Completion by domain"
          secondaryLabel="Instances closed and solved across domains"
          height={560}
          content={
            !!data?.id && <AlgorithmByMapTypeChart algorithm={data?.id} />
          }
        />
        <GridChartCard
          primaryLabel="Completion by map"
          secondaryLabel="Instances closed and solved across maps"
          height={560}
          content={!!data?.id && <AlgorithmByMapChart algorithm={data?.id} />}
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
