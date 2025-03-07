import { SearchRounded } from "@mui-symbols-material/w400";
import {
  Box,
  ButtonBase,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import {
  GridRow,
  GridRowProps,
  GridValidRowModel,
  DataGrid as MuiDataGrid,
  DataGridProps as MuiDataGridProps,
  GridColDef as MuiGridColDef,
} from "@mui/x-data-grid";
import { useScroll } from "components/dialog/Scrollbars";
import { useSm } from "components/dialog/useSmallDisplay";
import { filter, map, snakeCase } from "lodash";
import { ReactNode, useRef, useState } from "react";
import { useCss, useIntersection } from "react-use";
import { setFromEvent } from "utils/set";

function includeItemByFuzzyJSONString<T>(item: T, input: string): boolean {
  return snakeCase(JSON.stringify(item))
    .toLocaleUpperCase()
    .includes(snakeCase(input).toLocaleUpperCase());
}

export type GridColDef<T extends GridValidRowModel> = MuiGridColDef<T> & {
  fold?: boolean;
};

function ButtonRow(props: GridRowProps) {
  const root = useScroll();
  const ref = useRef();
  const observer = useIntersection(ref, {
    root,
    rootMargin: "512px 0px",
    threshold: 0,
  });
  return (
    <Box ref={ref} sx={{ height: props.rowHeight }}>
      {observer?.isIntersecting && (
        <ButtonBase
          sx={{ "& .MuiDataGrid-cell": { outline: "none !important" } }}
        >
          <GridRow {...props} />
        </ButtonBase>
      )}
    </Box>
  );
}

export type DataGridProps<T extends GridValidRowModel> = MuiDataGridProps<T> & {
  extras?: ReactNode;
  isLoading?: ReactNode;
  shouldIncludeItem?: (p: T, s: string) => boolean;
  clickable?: boolean;
  search?: boolean;
} & {
  columns: GridColDef<T>[];
};

export default function DataGrid<
  T extends GridValidRowModel = { [K: string | symbol]: unknown }
>({
  clickable,
  columns,
  rows,
  extras,
  shouldIncludeItem = includeItemByFuzzyJSONString,
  search,
  isLoading,
  ...rest
}: DataGridProps<T>) {
  const sm = useSm();
  const center = useCss({ display: "flex", alignItems: "center" });
  const [input, setInput] = useState("");

  return (
    <Stack>
      {search &&
        (sm ? (
          // Spacing for mobile mode
          <Box sx={{ p: 1 }} />
        ) : (
          <Stack
            sx={{ py: 2, gap: 2 }}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <TextField
              variant="outlined"
              label="Search items"
              placeholder="Start typing here"
              value={input}
              onChange={setFromEvent(setInput)}
              sx={{ width: "100%" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded />
                  </InputAdornment>
                ),
              }}
            />
            {extras && <Stack>{extras}</Stack>}
          </Stack>
        ))}
      {isLoading ? (
        <CircularProgress sx={{ mx: "auto", my: 4 }} />
      ) : (
        <MuiDataGrid<T>
          rowSelection={false}
          autoHeight
          rowHeight={88}
          slots={clickable && { row: ButtonRow }}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          {...rest}
          sx={{
            "--DataGrid-containerBackground": "transparent",
            border: "none",
            "& .MuiDataGrid-cell:nth-child(2)": {
              pl: sm ? 2 : 0,
            },
            "& .MuiDataGrid-cell:last-child": {
              pr: sm ? 2 : 0,
            },
            "& .MuiDataGrid-columnHeader:nth-child(2)": { pl: 2 },
            ...(sm && {
              "&, [class^=MuiDataGrid]": {
                "--DataGrid-rowBorderColor": "transparent",
                "--rowBorderColor": "transparent",
              },
            }),
            ...rest.sx,
          }}
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
          rows={filter(rows, (c) => shouldIncludeItem(c, input))}
        />
      )}
    </Stack>
  );
}
