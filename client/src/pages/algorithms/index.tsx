import { Button, Stack } from "@mui/material";
import { Item } from "components/Item";
import { Tip } from "components/Tip";
import { formatLargeNumber } from "components/charts/CompletionByAlgorithmChart";
import { DataGrid, cellRendererBar } from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { useSm } from "components/dialog/useSmallDisplay";
import { AlgorithmDetails } from "core/types";
import { useNavigate } from "hooks/useNavigation";
import { GalleryLayout } from "layout/GalleryLayout";
import { flatMap, map, max, slice, startCase } from "lodash";
import { useAlgorithmDetailsData } from "queries/useAlgorithmQuery";
import { AlgorithmPreview } from "./AlgorithmPreview";

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
      headerName: "Algorithm",
      renderHeader: () => <></>,
      sortable: true,
      minWidth: 180,
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
      "instances_solved",
      "instances_closed",
      "best_lower",
      "best_solution",
    ].map((c) => ({
      field: c,
      flex: 1,
      headerName: startCase(c),
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
      width: 200,
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
      description="Explore the latest submissions from the community."
      cover={
        <Stack direction="row" sx={{ width: "100%", flexWrap: "wrap" }}>
          {map(sample, (row) => (
            <AlgorithmPreview id={row.id} />
          ))}
        </Stack>
      }
      items={[{ value: algorithms?.length, label: "Submission count" }]}
      path={[{ name: "Home", url: "/" }]}
    >
      <Tip
        title={<>Browse submissions</>}
        description={
          <>
            Browse state-of-the-art solutions for grid-based multi-agent
            pathfinding. Analyse trends, compare algorithms, or download the
            dataset for your own use.
          </>
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
              Make a submission
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
