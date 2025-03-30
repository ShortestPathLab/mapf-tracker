import { useTheme } from "@mui/material";
import { Item } from "components/Item";
import { PreviewCard } from "components/PreviewCard";
import {
  cellRendererBar,
  cellRendererChip,
  cellRendererText,
} from "components/data-grid";
import DataGrid, { GridColDef } from "components/data-grid/DataGrid";
import { Map } from "core/types";
import { useNavigate } from "hooks/useNavigation";
import { capitalize, startCase } from "lodash";
import { MapLevelLocationState } from "pages/benchmarks-map-level/MapLevelLocationState";
import { useMapsData } from "queries/useMapQuery";

const parseSize = (s: string) => {
  const [a, b] = s.split("x");
  return +a * +b;
};

export default function Table() {
  const { data, isLoading } = useMapsData();
  const navigate = useNavigate();
  const theme = useTheme();

  const columns: GridColDef<Map>[] = [
    {
      field: "map_name",
      headerName: "Map",
      sortable: true,
      minWidth: 80,
      flex: 2,
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
      maxWidth: 260,
    },
    {
      field: "map_size",
      headerName: "Size",
      sortable: true,
      sortComparator: (a, b) => parseSize(a) - parseSize(b),
      fold: true,
      renderCell: cellRendererText,
      flex: 1,
      maxWidth: 120,
    },
    {
      field: "map_type",
      headerName: "Domain",
      sortable: true,
      valueFormatter: capitalize,
      fold: true,
      renderCell: cellRendererChip,
      flex: 1,
      maxWidth: 120,
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
      flex: 2,
      maxWidth: 200,
    },
    {
      field: "closed_percentage",
      headerName: "Instances Closed",
      sortable: true,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: cellRendererBar,
      flex: 2,
      fold: true,
      maxWidth: 200,
    },
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
