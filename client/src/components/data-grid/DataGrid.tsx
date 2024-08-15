import { SearchOutlined } from "@mui/icons-material";
import {
  ButtonBase,
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
  GridRow,
  GridRowProps,
} from "@mui/x-data-grid";
import { useSm } from "components/dialog/useSmallDisplay";
import { filter, map, snakeCase } from "lodash";
import { ReactNode, useState } from "react";
import { useCss } from "react-use";
import { paper } from "theme";

function includeItemByFuzzyJSONString<T>(item: T, input: string): boolean {
  return snakeCase(JSON.stringify(item))
    .toLocaleUpperCase()
    .includes(snakeCase(input).toLocaleUpperCase());
}

export type GridColDef<T extends GridValidRowModel> = MuiGridColDef<T> & {
  fold?: boolean;
};

function ButtonRow(props: GridRowProps) {
  return (
    <ButtonBase sx={{ "& .MuiDataGrid-cell": { outline: "none !important" } }}>
      <GridRow {...props} />
    </ButtonBase>
  );
}

export default function DataGrid<T extends GridValidRowModel = {}>({
  clickable,
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
  clickable?: boolean;
} & { columns: GridColDef<T>[] }) {
  const sm = useSm();
  const center = useCss({ display: "flex", alignItems: "center" });
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
          rowSelection={false}
          sx={{
            "--DataGrid-containerBackground": "transparent",
            border: "none",
            "& .MuiDataGrid-cell:nth-child(2)": {
              pl: 2,
            },
            "& .MuiDataGrid-columnHeader:nth-child(2)": { pl: 2 },
          }}
          autoHeight
          rowHeight={88}
          slots={clickable && { row: ButtonRow }}
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
