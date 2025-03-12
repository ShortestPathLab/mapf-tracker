import { Button, Stack } from "@mui/material";
import { Item } from "components/Item";
import { Tip } from "components/Tip";
import { formatLargeNumber } from "components/charts/CompletionByAlgorithmChart";
import { DataGrid, cellRendererBar } from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { useSm } from "components/dialog/useSmallDisplay";
import { AlgorithmDetails } from "core/types";
import { useNavigate } from "hooks/useNavigation";
import { Prose } from "layout";
import { GalleryLayout } from "layout/GalleryLayout";
import { flatMap, map, max, slice, startCase, sum } from "lodash";
import { useAlgorithmDetailsData } from "queries/useAlgorithmQuery";
import { AlgorithmPreview } from "./AlgorithmPreview";
import Description from "./description.md";

const g = [
  "instances_solved",
  "instances_closed",
  "best_lower",
  "best_solution",
];

function Table() {
  const { data: algorithms } = useAlgorithmDetailsData();
  const total = max(flatMap(g, (c) => map(algorithms, c) || 1)) * 1.5;
  const navigate = useNavigate();
  const columns: GridColDef<AlgorithmDetails>[] = [
    {
      field: "algo_name",
      headerName: "Submission",
      sortable: true,
      maxWidth: 180,
      flex: 1,
      renderCell: ({ value, row }) => (
        <Item
          icon={<AlgorithmPreview id={row.id} />}
          primary={startCase(value)}
          secondary={row.authors}
        />
      ),
    },
    ...[
      { key: "instances_solved", name: "Instances solved" },
      { key: "instances_closed", name: "Instances closed" },
      { key: "best_lower", name: "Instances with best lower-bound" },
      { key: "best_solution", name: "Instances with best solution" },
    ].map(({ key, name }) => ({
      field: key,
      flex: 1,
      headerName: name,
      sortable: true,
      type: "number" as const,
      align: "center" as const,
      headerAlign: "center" as const,
      renderCell: ({ value = 0 }) =>
        cellRendererBar({
          value: value / total,
          label: formatLargeNumber(value),
          labelWidth: 36,
        }),
      fold: true,
      maxWidth: 200,
    })),
  ];
  return (
    <DataGrid
      clickable
      onRowClick={(row) => navigate(`/submissions/${row.id}`)}
      search
      columns={columns}
      rows={algorithms ?? []}
    />
  );
}

export default function AlgorithmsPage() {
  const sm = useSm();
  const { data: algorithms } = useAlgorithmDetailsData();
  const sample = slice(algorithms, 0, 16);
  return (
    <GalleryLayout
      root
      title="Submissions"
      cover={
        <Stack direction="row" sx={{ width: "100%", flexWrap: "wrap" }}>
          {map(sample, (row) => (
            <AlgorithmPreview id={row.id} />
          ))}
        </Stack>
      }
      items={[
        { value: algorithms?.length, label: "Submission count" },
        {
          label: "Total instances submitted",
          value: algorithms
            ? sum(map(algorithms, "instances_solved"))
            : undefined,
        },
      ]}
      path={[{ name: "Home", url: "/" }]}
    >
      <Tip
        title={<>Browse submissions</>}
        description={
          <Prose sx={{ fontSize: (t) => t.typography.body2.fontSize, my: -2 }}>
            <Description />
          </Prose>
        }
        actions={
          <>
            <Button
              sx={{ alignSelf: "flex-start", m: -1, mt: 0 }}
              onClick={() => open("/docs/about", "_blank")}
            >
              See the docs
            </Button>
            <Button
              sx={{ alignSelf: "flex-start", m: -1, mt: 0 }}
              onClick={() => open("/docs/about", "_blank")}
            >
              Make a submission instead
            </Button>
          </>
        }
      />
      <Stack sx={{ mx: sm ? -2 : 0 }}>
        <Table />
      </Stack>
    </GalleryLayout>
  );
}
