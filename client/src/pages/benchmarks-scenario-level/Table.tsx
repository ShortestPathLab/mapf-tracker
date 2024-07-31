import {
  FileDownloadOutlined,
  InfoOutlined,
  RouteOutlined,
} from "@mui/icons-material";
import { makeDataGridActions } from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { IconCard } from "IconCard";
import {
  downloadBenchmarks,
  downloadBenchmarksResultsCSV,
} from "pages/benchmarks-root-level/download";
import { ScenarioLevelLocationState } from "pages/benchmarks-scenario-level/ScenarioLevelLocationState";
import { VisualiserLocationState } from "pages/visualiser/VisualiserLocationState";
import { useScenarioCollectionData } from "queries/useBenchmarksQuery";
import { useSnackbarAction } from "Snackbar";
import { Scenario } from "types";
import { useLocationState, useNavigate } from "useNavigation";
import { downloadRow } from "./download";
import { Dialog, Title } from "components/dialog";
import { cloneElement } from "react";
import Details from "./Details";
import { Box } from "@mui/material";
import { formatDate } from "utils/format";

export default function Table() {
  const state = useLocationState<ScenarioLevelLocationState>();
  const { scenId, mapName, scenType, scenTypeID } = state;
  const { data, isLoading } = useScenarioCollectionData(scenId);
  const navigate = useNavigate();
  const notify = useSnackbarAction();

  const columns: GridColDef<Scenario>[] = [
    {
      field: "Icon",
      renderCell: () => <IconCard icon={<RouteOutlined />} />,
      flex: 0,
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
    },
    {
      field: "lower_cost",
      headerName: "Cost",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 150,
    },
    {
      field: "lower_algos",
      headerName: "Claims",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 150,
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
    },
    {
      field: "solution_cost",
      headerName: "Cost",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 150,
    },
    {
      field: "solution_algos",
      headerName: "Claims",
      type: "number",
      sortable: true,
      align: "left",
      headerAlign: "left",
      width: 150,
    },
    makeDataGridActions({
      items: [
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
      slotProps={{ row: { style: { cursor: "pointer" } } }}
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
        navigate<VisualiserLocationState>("/visualization", {
          ...state,
          path_id: row.solution_path_id,
          map_name: mapName,
          scen_string: `${mapName}-${scenType}-${scenTypeID}`,
          num_agents: row.agents,
        });
      }}
    />
  );
}
