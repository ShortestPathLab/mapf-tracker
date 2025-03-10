import { DownloadRounded } from "@mui-symbols-material/w400";
import { useTheme } from "@mui/material";
import { Item } from "components/Item";
import { PreviewCard } from "components/PreviewCard";
import { useSnackbarAction } from "components/Snackbar";
import {
  cellRendererBar,
  cellRendererChip,
  cellRendererText,
  useDataGridActions,
} from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { Benchmark } from "core/types";
import { useNavigate } from "hooks/useNavigation";
import { capitalize, startCase } from "lodash";
import { MapLevelLocationState } from "pages/benchmarks-map-level/MapLevelLocationState";
import { downloadMap } from "pages/benchmarks-map-level/download";
import { useBenchmarksData } from "queries/useBenchmarksQuery";
import { downloadBenchmarks, downloadBenchmarksResultsCSV } from "./download";

const parseSize = (s: string) => {
  const [a, b] = s.split("x");
  return +a * +b;
};

export default function Table() {
  const { data, isLoading } = useBenchmarksData();
  const navigate = useNavigate();
  const theme = useTheme();
  const notify = useSnackbarAction();

  const actions = useDataGridActions<Benchmark>({
    items: [],
    menuItems: [
      {
        name: "Download all scenarios (ZIP)",
        icon: <DownloadRounded />,
        action: notify(downloadBenchmarks, { end: "File downloaded" }),
      },
      {
        name: "Download map",
        action: (r) =>
          notify(downloadMap(r.map_name), { end: "Map downloaded" })(),
      },
      {
        name: "Download results (CSV)",
        action: notify(downloadBenchmarksResultsCSV, {
          end: "CSV downloaded",
        }),
      },
    ],
  });

  const columns: GridColDef<Benchmark>[] = [
    {
      field: "map_name",
      headerName: "Map",
      sortable: true,
      minWidth: 220,
      flex: 1,
      renderCell: ({ value, row }) => (
        <Item
          icon={
            <PreviewCard
              palette={{ obstacle: theme.palette.text.primary }}
              map={row.id}
            />
          }
          primary={startCase(value)}
          secondary={`${row.instances ?? "?"} instances`}
        />
      ),
    },
    {
      field: "map_size",
      headerName: "Size",
      sortable: true,
      sortComparator: (a, b) => parseSize(a) - parseSize(b),
      fold: true,
      renderCell: cellRendererText,
    },
    {
      field: "map_type",
      headerName: "Type",
      sortable: true,
      valueFormatter: capitalize,
      fold: true,
      renderCell: cellRendererChip,
    },
    {
      field: "solved_percentage",
      headerName: "Instances Solved",
      sortable: true,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: cellRendererBar,
      fold: true,
      width: 200,
    },
    {
      field: "closed_percentage",
      headerName: "Instances Closed",
      sortable: true,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: cellRendererBar,
      fold: true,
      width: 200,
    },
    actions,
  ];

  return (
    <>
      <DataGrid
        search
        clickable
        isLoading={isLoading}
        columns={columns}
        rows={data}
        onRowClick={({ row }) => {
          navigate<MapLevelLocationState>("/scenarios", {
            mapId: row.id,
          });
        }}
      />
    </>
  );
}
