import { Item } from "components/Item";
import { PreviewCard } from "components/PreviewCard";
import { cellRendererBar, cellRendererChip } from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { InstanceCollection } from "core/types";
import { useNavigate } from "hooks/useNavigation";
import { useStableLocationState } from "hooks/useStableLocationState";
import { startCase } from "lodash";
import { MapLevelLocationState } from "pages/benchmarks-map-level/MapLevelLocationState";
import { ScenarioLevelLocationState } from "pages/benchmarks-scenario-level/ScenarioLevelLocationState";
import { useInstanceScenarioData } from "queries/useBenchmarksQuery";

export default function Table() {
  const state = useStableLocationState<MapLevelLocationState>();
  const { mapId } = state;
  const { data, isLoading } = useInstanceScenarioData(mapId);
  const navigate = useNavigate();

  const columns: GridColDef<InstanceCollection>[] = [
    {
      field: "type_id",
      headerName: "Scenario",
      sortComparator: (a, b, paramA, paramB) => {
        return paramA.api.getRow(paramA.id).scen_type ===
          paramB.api.getRow(paramB.id).scen_type
          ? +paramA.api.getRow(paramA.id).type_id -
              +paramB.api.getRow(paramB.id).type_id
          : a.localeCompare(b);
      },
      sortable: true,
      maxWidth: 260,
      flex: 2,
      valueGetter: (_, row) => `${startCase(row.scen_type)} ${row.type_id}`,
      renderCell: ({ value, row }) => (
        <Item
          icon={<PreviewCard scenario={row.id} />}
          primary={startCase(value)}
          secondary={`${row.instances ?? "?"} instances`}
        />
      ),
    },
    {
      field: "scen_type",
      headerName: "Type",
      sortable: true,
      renderCell: cellRendererChip,
      valueFormatter: startCase,
      fold: true,
      maxWidth: 120,
      flex: 1,
    },
    {
      field: "solved_percentage",
      headerName: "Instances solved",
      sortable: true,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: cellRendererBar,
      fold: true,
      maxWidth: 200,
      flex: 2,
    },
    {
      field: "closed_percentage",
      headerName: "Instances closed",
      sortable: true,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: cellRendererBar,
      fold: true,
      maxWidth: 200,
      flex: 2,
    },
  ];

  return (
    <DataGrid
      clickable
      search
      isLoading={isLoading}
      columns={columns}
      rows={data}
      onRowClick={({ row }) => {
        navigate<ScenarioLevelLocationState>("/instances", {
          ...state,
          scenId: row.id,
        });
      }}
    />
  );
}
