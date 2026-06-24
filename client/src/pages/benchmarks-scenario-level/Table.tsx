import { Dot } from "components/Dot";
import { Item } from "components/Item";
import { cellRendererText } from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { InstanceSummary } from "core/types";
import { useNavigate } from "hooks/useNavigation";
import { useStableLocationState } from "hooks/useStableLocationState";
import { ScenarioLevelLocationState } from "pages/benchmarks-scenario-level/ScenarioLevelLocationState";
import { VisualiserLocationState } from "pages/visualiser/VisualiserLocationState";
import pluralize from "pluralize";
import { useInstancesByScenario } from "queries/useMapQuery";
import { useMakespanData } from "queries/useMakespanQuery";
import { formatDate } from "utils/format";
import { PreviewCard } from "../../components/PreviewCard";
import { Typography } from "@mui/material";

function MakespanCell({ row }: { row: InstanceSummary }) {
  const { data } = useMakespanData({
    instance: row.id,
    solutionPath: row.solution_path_id,
  });
  return <Typography>{data?.toLocaleString?.() ?? "--"}</Typography>;
}

export default function Table() {
  const state =
    useStableLocationState<ScenarioLevelLocationState>() as ScenarioLevelLocationState;
  const { scenId } = state;
  const { data, isLoading } = useInstancesByScenario(scenId);
  const navigate = useNavigate();

  const openVisualisation = (row: InstanceSummary) =>
    navigate<VisualiserLocationState>("/visualization", {
      ...state,
      instanceId: row.id,
      solutionId: row.solution_path_id,
      source: "submitted",
    });

  const columns: GridColDef<InstanceSummary>[] = [
    {
      field: "agents",
      headerName: "Agent count",
      type: "number",
      sortable: true,
      flex: 3,
      maxWidth: 260,
      renderCell: ({ value, row }) => (
        <Item
          icon={<PreviewCard instance={row.id} />}
          primary={pluralize("agent", value, true)}
          secondary={
            row.solution_algos ? (
              row.solution_cost === row.lower_cost ? (
                <>
                  <Dot sx={{ bgcolor: "info.main", mr: 0.5 }} /> Closed
                </>
              ) : (
                <>
                  <Dot sx={{ bgcolor: "success.main" }} /> Solved
                </>
              )
            ) : (
              <>
                <Dot sx={{ bgcolor: "warning.main", mr: 0.5 }} /> Open
              </>
            )
          }
        />
      ),
    },
    {
      field: "lower_date",
      headerName: "Claim date",
      valueFormatter: (v) => formatDate(v),
      sortable: true,
      align: "left",
      headerAlign: "left",
      flex: 2,
      maxWidth: 180,
      fold: true,
      renderCell: cellRendererText,
    },
    {
      field: "lower_cost",
      headerName: "Cost",
      sortable: true,
      align: "left",
      headerAlign: "left",
      flex: 1,
      maxWidth: 70,
      fold: true,
      renderCell: cellRendererText,
    },
    {
      field: "lower_algos",
      headerName: "Claims",
      sortable: true,
      align: "left",
      headerAlign: "left",
      flex: 1,
      maxWidth: 70,
      fold: true,
      renderCell: cellRendererText,
    },
    {
      field: "solution_date",
      headerName: "Claim date",
      valueFormatter: (v) => formatDate(v),
      type: "number",
      sortable: true,
      align: "left",
      headerAlign: "left",
      flex: 2,
      maxWidth: 180,
      fold: true,
      renderCell: cellRendererText,
    },
    {
      field: "solution_cost",
      headerName: "Cost",
      sortable: true,
      align: "left",
      headerAlign: "left",
      flex: 1,
      maxWidth: 70,
      fold: true,
      renderCell: cellRendererText,
    },
    {
      field: "makespan",
      headerName: "Makespan",
      type: "number",
      sortable: false,
      align: "left",
      headerAlign: "left",
      flex: 1,
      maxWidth: 100,
      fold: true,
      renderCell: ({ row }) => <MakespanCell row={row} />,
    },
    {
      field: "solution_algos",
      headerName: "Claims",
      type: "number",
      sortable: true,
      align: "left",
      headerAlign: "left",
      flex: 1,
      maxWidth: 70,
      fold: true,
      renderCell: cellRendererText,
    },
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
            { field: "makespan" },
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
