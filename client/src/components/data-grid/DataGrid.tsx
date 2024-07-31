import { SearchOutlined } from "@mui/icons-material";
import {
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import {
  GridColDef as MuiGridColDef,
  GridValidRowModel,
  DataGrid as MuiDataGrid,
  DataGridProps as MuiDataGridProps,
  GridToolbar,
} from "@mui/x-data-grid";
import { useSm } from "components/dialog/useSmallDisplay";
import { filter, map, snakeCase } from "lodash";
import { ReactNode, useState } from "react";
import { useCss } from "react-use";

function includeItemByFuzzyJSONString<T>(item: T, input: string): boolean {
  return snakeCase(JSON.stringify(item))
    .toLocaleUpperCase()
    .includes(snakeCase(input).toLocaleUpperCase());
}

export type GridColDef<T extends GridValidRowModel> = MuiGridColDef<T> & {
  fold?: boolean;
};

export default function DataGrid<T extends GridValidRowModel = {}>({
  columns,
  rows,
  extras,
  shouldIncludeItem = includeItemByFuzzyJSONString,
  isLoading,
  ...rest
}: MuiDataGridProps<T> & {
  extras?: ReactNode;
  isLoading?: ReactNode;
  shouldIncludeItem?: (p: T, s: string) => boolean;
} & { columns: GridColDef<T>[] }) {
  const sm = useSm();
  const center = useCss({ display: "flex", alignItems: "center" });
  // const dataGrid
  const [input, setInput] = useState("");

  return (
    <Stack>
      <Stack
        sx={{ p: 2, gap: 2 }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <TextField
          variant="filled"
          label="Search items"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          sx={{ width: "100%" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            ),
          }}
        />
        {extras && <Stack>{extras}</Stack>}
      </Stack>
      {isLoading ? (
        <CircularProgress sx={{ mx: "auto", mt: 2, mb: 4 }} />
      ) : (
        <MuiDataGrid<T>
          slotProps={{
            filterPanel: { sx: { background: "red" } },
            columnMenu: {
              style: {
                background: "red",
              },
            },
          }}
          rowSelection={false}
          sx={{
            "--DataGrid-containerBackground": "transparent",
            border: "none",
          }}
          autoHeight
          rowHeight={88}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          {...rest}
          columns={map(sm ? filter(columns, (c) => !c.fold) : columns, (c) => ({
            type: "string",
            field: "",
            headerName: "",
            sortable: false,
            align: "left",
            headerAlign: "left",
            cellClassName: center,
            ...c,
          }))}
          rows={filter(rows, (c) => includeItemByFuzzyJSONString(c, input))}
        />
      )}
    </Stack>
  );
}
