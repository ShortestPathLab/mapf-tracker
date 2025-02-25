import { Avatar } from "@mui/material";
import { Item } from "components/Item";
import { DataGrid, cellRendererBar } from "components/data-grid";
import { GridColDef } from "components/data-grid/DataGrid";
import { AlgorithmDetails } from "core/types";
import { Layout } from "layout";
import { flatMap, map, max, startCase } from "lodash";
import { useAlgorithmDetailsData } from "queries/useAlgorithmQuery";

const g = [
  "instances_solved",
  "instances_closed",
  "best_lower",
  "best_solution",
];

function Table() {
  const { data: algorithms } = useAlgorithmDetailsData();
  const total = max(flatMap(g, (c) => map(algorithms, c) || 1)) * 1.5;

  const columns: GridColDef<AlgorithmDetails>[] = [
    {
      field: "algo_name",
      headerName: "Algorithm",
      renderHeader: () => <></>,
      sortable: true,
      minWidth: 220,
      flex: 1,
      renderCell: ({ value, row }) => (
        <Item
          icon={
            <Avatar
              src={`https://api.dicebear.com/9.x/identicon/svg?seed=${value}`}
            />
          }
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
      headerName: startCase(c),
      sortable: true,
      type: "number" as const,
      align: "center" as const,
      headerAlign: "center" as const,
      renderCell: ({ value = 0 }) =>
        cellRendererBar({
          value: value / total,
          label: value,
          labelWidth: 36,
        }),
      fold: true,
      width: 300,
    })),
  ];
  return <DataGrid search columns={columns} rows={algorithms ?? []} />;
}

export default function AlgorithmsPage() {
  return (
    <Layout title="Submissions" path={[{ name: "Home", url: "/" }]}>
      <Table />
    </Layout>
  );
}
