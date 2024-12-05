import { FileDownloadOutlined, ShowChartOutlined } from "@mui/icons-material";
import { IconCard } from "components/IconCard";
import { Item } from "components/Item";
import { useSnackbarAction } from "components/Snackbar";
import { AnalysisButton } from "components/analysis/Analysis";
import {
  cellRendererBar,
  cellRendererText,
  useDataGridActions,
} from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { InstanceCollection } from "core/types";
import { useLocationState, useNavigate } from "hooks/useNavigation";
import { capitalize } from "lodash";
import { MapLevelLocationState } from "pages/benchmarks-map-level/MapLevelLocationState";
import { ScenarioLevelLocationState } from "pages/benchmarks-scenario-level/ScenarioLevelLocationState";
import { analysisTemplate } from "pages/benchmarks-scenario-level/analysisTemplate";
import { useInstanceCollectionsData } from "queries/useBenchmarksQuery";
import { cloneElement } from "react";
import { downloadInstance, downloadMap, downloadScenario } from "./download";

export default function Table() {
  const state = useLocationState<MapLevelLocationState>();
  const { mapId, mapName } = state;
  const { data, isLoading } = useInstanceCollectionsData(mapId);
  const navigate = useNavigate();
  const notify = useSnackbarAction();

  const actions = useDataGridActions<InstanceCollection>({
    items: [
      {
        name: "Analyse this dataset",
        icon: <ShowChartOutlined />,
        render: (row, trigger) => (
          <AnalysisButton
            button={(onClick) => cloneElement(trigger, { onClick })}
            template={analysisTemplate(
              row.scen_type,
              row.type_id,
              mapName,
              row.id,
              mapId
            )}
          />
        ),
      },
    ],
    menuItems: [
      {
        name: "Download scenario",
        icon: <FileDownloadOutlined />,
        action: notify(downloadScenario(mapName), {
          end: "Scenario downloaded",
        }),
      },
      {
        name: "Download map",
        action: notify(downloadMap(mapName), { end: "Map downloaded" }),
      },
      {
        name: "Download results (CSV)",
        action: notify(downloadInstance(mapName), {
          end: "CSV downloaded",
        }),
      },
    ],
  });

  const columns: GridColDef<InstanceCollection>[] = [
    {
      field: "Icon",
      width: 48,
      renderCell: () => <IconCard />,
      flex: 0,
    },
    {
      field: "type_id",
      headerName: "Scenario ID",
      type: "number",
      sortable: true,
      width: 160,
      renderCell: ({ value, row }) => (
        <Item
          primary={`Scenario ${value}`}
          secondary={`${row.instances ?? "?"} instances`}
        />
      ),
    },
    {
      field: "scen_type",
      headerName: "Scenario type",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 150,
      valueFormatter: capitalize,
      fold: true,
      renderCell: cellRendererText,
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
      width: 300,
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
      width: 300,
    },
    actions,
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
          scenTypeID: row.type_id,
          scenType: row.scen_type,
        });
      }}
    />
  );
}
