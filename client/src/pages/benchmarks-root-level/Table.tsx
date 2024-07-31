import {
  FileDownloadOutlined,
  InfoOutlined,
  ShowChartOutlined,
} from "@mui/icons-material";
import { Box, Tooltip } from "@mui/material";
import { cellRendererBar, makeDataGridActions } from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { Dialog, Title } from "components/dialog";
import { IconCard } from "IconCard";
import { capitalize } from "lodash";
import { MapLevelLocationState } from "pages/benchmarks-map-level/MapLevelLocationState";
import { useBenchmarksData } from "queries/useBenchmarksQuery";
import { cloneElement } from "react";
import { useSnackbarAction } from "Snackbar";
import { Benchmark } from "types";
import { useNavigate } from "useNavigation";
import BenchmarkDetails from "./BenchmarkDetails";
import { downloadBenchmarks, downloadBenchmarksResultsCSV } from "./download";
import { analysisTemplate } from "pages/benchmarks-map-level/analysisTemplate";
import { AnalysisButton } from "components/analysis/Analysis";
import { downloadMap } from "pages/benchmarks-map-level/download";

export default function Table() {
  const { data, isLoading } = useBenchmarksData();
  const navigate = useNavigate();
  const notify = useSnackbarAction();

  const columns: GridColDef<Benchmark>[] = [
    {
      field: "Icon",
      renderCell: () => <IconCard />,
      flex: 0,
    },
    {
      field: "map_name",
      headerName: "Map Name",
      sortable: true,
      width: 160,
      valueFormatter: capitalize,
    },
    {
      field: "preview",
      headerName: "Preview",
      valueGetter: (_, r) => r.map_name,
      fold: true,
      renderCell: ({ value }) => (
        <Tooltip
          title={
            <Box
              component="img"
              sx={{ borderRadius: 1, height: 256 }}
              src={`/mapf-svg/${value}.svg`}
            />
          }
        >
          <Box
            component="img"
            sx={{ borderRadius: 1, height: 48 }}
            src={`/mapf-svg/${value}.svg`}
          />
        </Tooltip>
      ),
    },
    {
      field: "map_size",
      headerName: "Size",
      sortable: true,
      fold: true,
    },
    {
      field: "map_type",
      headerName: "Type",
      sortable: true,
      valueFormatter: capitalize,
      fold: true,
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
      width: 300,
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
              template={analysisTemplate(row.map_name, row.id)}
            />
          ),
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
                <BenchmarkDetails benchmark={row.map_name} />
              </Box>
            </Dialog>
          ),
        },
      ],
      menuItems: [
        {
          name: "Download all scenarios (ZIP)",
          icon: <FileDownloadOutlined />,
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
    }),
  ];

  return (
    <DataGrid
      slotProps={{ row: { style: { cursor: "pointer" } } }}
      isLoading={isLoading}
      columns={columns}
      rows={data}
      onRowClick={({ row }) => {
        navigate<MapLevelLocationState>("/scenarios", {
          mapId: row.id,
          mapName: row.map_name,
        });
      }}
    />
  );
}
