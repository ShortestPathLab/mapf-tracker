import { Divider, Link, Stack } from "@mui/material";
import { GridChartCard } from "components/charts/GridChartCard";
import { useSm } from "components/dialog/useSmallDisplay";
import { DownloadBar } from "components/DownloadBar";
import { GalleryLayout } from "layout/GalleryLayout";
import { AlgorithmByMapChart } from "pages/benchmarks-root-level/charts/AlgorithmByMapChart";
import { AlgorithmByMapTypeChart } from "pages/benchmarks-root-level/charts/AlgorithmByMapTypeChart";

import { useAlgorithmDetailData } from "queries/useAlgorithmQuery";
import { matchPath, redirect } from "react-router-dom";
import { AlgorithmPreview } from "./AlgorithmPreview";
import { Title } from "../../components/StickyTitle";
import { Table } from "./Table";
import { TableRounded } from "@mui-symbols-material/w400";
import { inferOptimality } from "./inferOptimality";

export function AlgorithmPage() {
  const sm = useSm();
  const { params } = matchPath("/submissions/:id", window.location.pathname);

  const { data } = useAlgorithmDetailData(params?.id);

  if (!params?.id) redirect("/");

  return (
    <GalleryLayout
      cover={<AlgorithmPreview id={data?.id} />}
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
    >
      <DownloadBar
        options={[
          {
            icon: <TableRounded />,
            label: "Instances (.csv) (coming soon)",
            primary: true,
          },
        ]}
      />
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
    </GalleryLayout>
  );
}
