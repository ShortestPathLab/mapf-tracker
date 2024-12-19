import { FileDownloadOutlined } from "@mui/icons-material";
import { Item } from "components/Item";
import { useSnackbarAction } from "components/Snackbar";
import { cellRendererText, useDataGridActions } from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { Instance } from "core/types";
import { useLocationState, useNavigate } from "hooks/useNavigation";
import { ScenarioLevelLocationState } from "pages/benchmarks-scenario-level/ScenarioLevelLocationState";
import { VisualiserLocationState } from "pages/visualiser/VisualiserLocationState";
import pluralize from "pluralize";
import { useInstanceCollectionData } from "queries/useBenchmarksQuery";
import { formatDate } from "utils/format";
import { PreviewCard } from "../../components/PreviewCard";
import { downloadRow } from "./download";

export default function Table() {
  const state = useLocationState<ScenarioLevelLocationState>();
  const { scenId } = state;
  const { data, isLoading } = useInstanceCollectionData(scenId);
  const navigate = useNavigate();
  const notify = useSnackbarAction();

  const openVisualisation = (row: Instance) =>
    navigate<VisualiserLocationState>("/visualization", {
      ...state,
      instanceId: row.id,
      solutionId: undefined,
      source: "submitted",
    });

  const actions = useDataGridActions<Instance>({
    items: [],
    menuItems: [
      {
        name: "Download result (CSV)",
        icon: <FileDownloadOutlined />,
        action: notify(downloadRow, { end: "File downloaded" }),
      },
    ],
  });

  const columns: GridColDef<Instance>[] = [
    {
      field: "agents",
      headerName: "",
      type: "number",
      sortable: true,
      width: 200,
      renderCell: ({ value, row }) => (
        <Item
          icon={<PreviewCard instance={row.id} />}
          primary={pluralize("agent", value, true)}
          secondary={row.solution_algos ? "Solved" : "Unsolved"}
        />
      ),
    },
    {
      field: "lower_date",
      headerName: "Claim date",
      valueFormatter: formatDate,
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 180,
      fold: true,
      renderCell: cellRendererText,
    },
    {
      field: "lower_cost",
      headerName: "Cost",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 70,
      fold: true,
      renderCell: cellRendererText,
    },
    {
      field: "lower_algos",
      headerName: "Claims",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 70,
      fold: true,
      renderCell: cellRendererText,
    },
    {
      field: "solution_date",
      headerName: "Claim date",
      valueFormatter: formatDate,
      type: "number",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 180,
      fold: true,
      renderCell: cellRendererText,
    },
    {
      field: "solution_cost",
      headerName: "Cost",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 70,
      fold: true,
      renderCell: cellRendererText,
    },
    {
      field: "solution_algos",
      headerName: "Claims",
      type: "number",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 70,
      fold: true,
      renderCell: cellRendererText,
    },
    actions,
  ];

  return (
    <DataGrid
      search
      clickable
      isLoading={isLoading}
      columnGroupingModel={[
        {
          groupId: "Lower bound record",
          children: [
            { field: "lower_date" },
            { field: "lower_cost" },
            { field: "lower_algos" },
          ],
        },
        {
          groupId: "Solution record",
          children: [
            { field: "solution_date" },
            { field: "solution_cost" },
            { field: "solution_algos" },
          ],
        },
      ]}
      columns={columns}
      rows={data}
      onRowClick={({ row }) => {
        openVisualisation(row);
      }}
    />
  );
}
