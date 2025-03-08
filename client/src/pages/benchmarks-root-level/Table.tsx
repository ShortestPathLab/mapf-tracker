import {
  DownloadRounded,
  InfoRounded,
  ShowChartRounded,
} from "@mui-symbols-material/w400";
import { Box, useTheme } from "@mui/material";
import { Item } from "components/Item";
import { PreviewCard } from "components/PreviewCard";
import { useSnackbarAction } from "components/Snackbar";
import { AnalysisButton } from "components/analysis/Analysis";
import {
  cellRendererBar,
  cellRendererChip,
  cellRendererText,
  useDataGridActions,
} from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { Benchmark } from "core/types";
import { useDialog } from "hooks/useDialog";
import { useNavigate } from "hooks/useNavigation";
import { capitalize, startCase } from "lodash";
import { MapLevelLocationState } from "pages/benchmarks-map-level/MapLevelLocationState";
import { analysisTemplate } from "pages/benchmarks-map-level/analysisTemplate";
import { downloadMap } from "pages/benchmarks-map-level/download";
import { useBenchmarksData } from "queries/useBenchmarksQuery";
import { cloneElement } from "react";
import BenchmarkDetails from "./BenchmarkDetails";
import { downloadBenchmarks, downloadBenchmarksResultsCSV } from "./download";

function Details({ mapName }: { mapName: string }) {
  return (
    <Box sx={{ m: -2 }}>
      <BenchmarkDetails benchmark={mapName} />
    </Box>
  );
}

export default function Table() {
  const { data, isLoading } = useBenchmarksData();
  const navigate = useNavigate();
  const theme = useTheme();
  const notify = useSnackbarAction();
  const { dialog, open } = useDialog(Details, {
    slotProps: { modal: { width: 720 } },
    padded: true,
    title: "Benchmark details",
  });

  const actions = useDataGridActions<Benchmark>({
    items: [
      {
        name: "Trends",
        icon: <ShowChartRounded />,
        render: (row, trigger) => (
          <AnalysisButton
            button={(onClick) => cloneElement(trigger, { onClick })}
            template={analysisTemplate(row.id)}
          />
        ),
      },
      {
        name: "Details",
        icon: <InfoRounded />,
        action: (row) => open({ mapName: row.map_name }),
      },
    ],
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
      {dialog}
    </>
  );
}
