import {
  BlurOnOutlined,
  FileDownloadOutlined,
  InfoOutlined,
  RouteOutlined,
} from "@mui/icons-material";
import { Box } from "@mui/material";
import { makeDataGridActions } from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { Dialog, Title } from "components/dialog";
import { IconCard } from "components/IconCard";
import { ScenarioLevelLocationState } from "pages/benchmarks-scenario-level/ScenarioLevelLocationState";
import { VisualiserLocationState } from "pages/visualiser/VisualiserLocationState";
import { useScenarioCollectionData } from "queries/useBenchmarksQuery";
import { cloneElement } from "react";
import { useSnackbarAction } from "components/Snackbar";
import { Scenario } from "core/types";
import { useLocationState, useNavigate } from "hooks/useNavigation";
import { formatDate } from "utils/format";
import Details from "./Details";
import { downloadRow } from "./download";

export default function Table() {
  const state = useLocationState<ScenarioLevelLocationState>();
  const { scenId, mapName, scenType, scenTypeID } = state;
  const { data, isLoading } = useScenarioCollectionData(scenId);
  const navigate = useNavigate();
  const notify = useSnackbarAction();

  const openVisualisation = (row: Scenario) =>
    navigate<VisualiserLocationState>("/visualization", {
      ...state,
      path_id: row.solution_path_id,
      map_name: mapName,
      scen_string: `${mapName}-${scenType}-${scenTypeID}`,
      num_agents: row.agents,
    });

  const columns: GridColDef<Scenario>[] = [
    {
      field: "Icon",
      renderCell: () => <IconCard icon={<RouteOutlined />} />,
      flex: 0,
      fold: true,
    },
    {
      field: "agents",
      headerName: "Agent count",
      type: "number",
      sortable: true,
      width: 160,
    },
    {
      field: "lower_date",
      headerName: "Claim date",
      valueFormatter: formatDate,
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 150,
      fold: true,
    },
    {
      field: "lower_cost",
      headerName: "Cost",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 150,
      fold: true,
    },
    {
      field: "lower_algos",
      headerName: "Claims",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 150,
      fold: true,
    },
    {
      field: "solution_date",
      headerName: "Claim date",
      valueFormatter: formatDate,
      type: "number",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 150,
      fold: true,
    },
    {
      field: "solution_cost",
      headerName: "Cost",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 150,
      fold: true,
    },
    {
      field: "solution_algos",
      headerName: "Claims",
      type: "number",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 150,
      fold: true,
    },
    makeDataGridActions({
      items: [
        {
          name: "Open visualisation",
          icon: <BlurOnOutlined />,
          action: openVisualisation,
        },
        {
          name: "Details",
          icon: <InfoOutlined />,
          render: (row, trigger) => (
            <Dialog
              slotProps={{ modal: { width: 720 } }}
              appBar={{ children: <Title>Benchmark details</Title> }}
              trigger={(onClick) => cloneElement(trigger, { onClick })}
            >
              <Box sx={{ p: 1 }}>
                <Details id={row.id} />
              </Box>
            </Dialog>
          ),
        },
      ],
      menuItems: [
        {
          name: "Download result (CSV)",
          icon: <FileDownloadOutlined />,
          action: notify(downloadRow, { end: "File downloaded" }),
        },
      ],
    }),
  ];

  return (
    <DataGrid
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
