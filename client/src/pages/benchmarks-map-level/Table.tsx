import {
  InfoOutlined,
  Title,
  FileDownloadOutlined,
  ShowChartOutlined,
} from "@mui/icons-material";
import { Box } from "@mui/material";
import { AnalysisButton } from "components/analysis/Analysis";
import { cellRendererBar, makeDataGridActions } from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { IconCard } from "IconCard";
import { capitalize } from "lodash";
import { bindTrigger } from "material-ui-popup-state";
import { MapLevelLocationState } from "pages/benchmarks-map-level/MapLevelLocationState";
import BenchmarkDetails from "pages/benchmarks-root-level/BenchmarkDetails";
import {
  downloadBenchmarks,
  downloadBenchmarksResultsCSV,
} from "pages/benchmarks-root-level/download";
import { analysisTemplate } from "pages/benchmarks-scenario-level/analysisTemplate";
import { ScenarioLevelLocationState } from "pages/benchmarks-scenario-level/ScenarioLevelLocationState";
import { useScenarioCollectionsData } from "queries/useBenchmarksQuery";
import { cloneElement } from "react";
import { useSnackbarAction } from "Snackbar";
import { ScenarioCollection } from "types";
import { useLocationState, useNavigate } from "useNavigation";
import { downloadInstance, downloadMap, downloadScenario } from "./download";

export default function Table() {
  const state = useLocationState<MapLevelLocationState>();
  const { mapId, mapName } = state;
  const { data, isLoading } = useScenarioCollectionsData(mapId);
  const navigate = useNavigate();
  const notify = useSnackbarAction();
  const columns: GridColDef<ScenarioCollection>[] = [
    {
      field: "Icon",
      renderCell: () => <IconCard />,
      flex: 0,
    },
    {
      field: "type_id",
      headerName: "Scenario ID",
      type: "number",
      sortable: true,
      width: 160,
    },
    {
      field: "scen_type",
      headerName: "Scenario type",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 150,
      valueFormatter: capitalize,
    },
    {
      field: "instances",
      headerName: "Instance count",
      type: "number",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 150,
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
    makeDataGridActions({
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
    }),
  ];

  return (
    <DataGrid
      slotProps={{ row: { style: { cursor: "pointer" } } }}
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
