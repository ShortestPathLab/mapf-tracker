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
import { useXs } from "components/dialog/useSmallDisplay";
import Fuse from "fuse.js";
import { useTop } from "layout/TabBar";
import { debounce, filter, find, get, join, map, throttle } from "lodash";
import {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCss } from "react-use";
import { setFromEvent } from "utils/set";

import { useBottomBar } from "App";
import { createContext } from "react";

export const DataGridContext = createContext<HTMLDivElement | null>(null);

const useDataGridContext = () => useContext(DataGridContext);

export type GridColDef<T extends GridValidRowModel> = MuiGridColDef<T> & {
  fold?: boolean;
};

const padding = 88 * 6;

function ButtonRowBase(props: GridRowProps) {
  return (
    <ButtonBase sx={{ "& .MuiDataGrid-cell": { outline: "none !important" } }}>
      <GridRow {...props} />
    </ButtonBase>
  );
}

function ButtonRow(props: GridRowProps) {
  const dataGrid = useDataGridContext();
  const root = useScroll();
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!dataGrid) return;

    const controller = new AbortController();
    const listener = throttle(() => {
      const rootOffset = dataGrid.getBoundingClientRect().top;
      const offset = props.offsetTop + rootOffset;
      setVisible(
        offset + props.dimensions.rowHeight + padding > 0 &&
          offset - padding < window.innerHeight
      );
    }, 150);
    addEventListener("resize", listener, {
      passive: true,
      signal: controller.signal,
    });
    root?.addEventListener?.("scroll", listener, {
      passive: true,
      signal: controller.signal,
    });
    const interval = setInterval(listener, 1000);
    listener();
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [root, props.index, props.rowHeight, setVisible, dataGrid]);
  return (
    <Box ref={ref} sx={{ height: props.rowHeight, width: "100%" }}>
      {visible && <ButtonRowBase {...props} />}
    </Box>
  );
}

export type DataGridProps<T extends GridValidRowModel> = MuiDataGridProps<T> & {
  extras?: ReactNode;
  isLoading?: ReactNode;
  shouldIncludeItem?: (p: T) => boolean;
  clickable?: boolean;
  search?: boolean;
} & {
  columns: GridColDef<T>[];
};

function useDebouncedInput() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const queueInput = useMemo(() => {
    const f = debounce((e) => {
      setInput(e);
      setLoading(false);
    }, 600);
    return (e: string) => {
      setLoading(true);
      f(e);
    };
  }, [setInput, setLoading]);

  return { loading, input, queueInput };
}

export default function DataGrid<
  T extends GridValidRowModel = { [K: string | symbol]: unknown }
>({
  clickable,
  columns,
  rows,
  extras,
  shouldIncludeItem = () => true,
  search,
  isLoading,
  ...rest
}: DataGridProps<T>) {
  const { enabled: bottomBarEnabled } = useBottomBar();
  const ref = useRef<HTMLDivElement>(null);
  const top = useTop(ref);

  const [dataGridRef, setDataGridRef] = useState<HTMLDivElement | null>(null);

  const xs = useXs();
  const sm = useXs();
  const center = useCss({ display: "flex", alignItems: "center" });
  const { input, loading, queueInput } = useDebouncedInput();

  const fuse = new Fuse(rows, {
    useExtendedSearch: true,
    keys: columns?.map?.((c) => c.field),
    threshold: 0.1,
    getFn: (obj, path) => {
      const actualPath = typeof path === "string" ? path : join(path, ".");
      if (typeof actualPath !== "string") return;
      const column = find(columns, { field: actualPath });
      if (column?.valueGetter)
        return column.valueGetter(
          obj[actualPath] as unknown as never,
          obj,
          column,
          null
        );
      return `${get(obj, actualPath)}`;
    },
  });

  return (
    <Stack>
      {search && (
        <Stack
          ref={ref}
          sx={{
            py: xs ? 2 : 3,
            gap: 2,
            px: sm ? 2 : 0,
            height: "max-content",
            bgcolor: "background.paper",
            "&:has(input:focus)": {
              top: 0,
              position: "sticky",
              bgcolor: top ? "background.paper" : "background.default",
              zIndex: (t) => t.zIndex.fab - 1,
            },
          }}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <TextField
            onFocus={() => {
              ref.current?.scrollIntoView?.({
                behavior: "smooth",
                block: "start",
              });
            }}
            variant="filled"
            label="Search items"
            defaultValue={input}
            onChange={setFromEvent(queueInput)}
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
      )}
      {isLoading ? (
        <CircularProgress sx={{ mx: "auto", my: 4 }} />
      ) : (
        <>
          <DataGridContext.Provider value={dataGridRef}>
            <MuiDataGrid<T>
              ref={setDataGridRef}
              rowSelection={false}
              autoHeight
              rowHeight={88}
              slots={clickable && { row: ButtonRow }}
              initialState={{
                pagination: { paginationModel: { pageSize: 100 } },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              {...rest}
              sx={{
                overflow: "visible",
                opacity: loading ? 0.5 : 1,
                transition: (t) => t.transitions.create("opacity"),
                "--DataGrid-containerBackground": "transparent",
                border: "none",
                "& .MuiDataGrid-cell:nth-child(2)": {
                  pl: sm ? 2 : 0,
                },
                "& .MuiDataGrid-cell:last-child": {
                  pr: sm ? 2 : 0,
                },
                "& .MuiDataGrid-columnHeader:nth-child(2)": { pl: sm ? 2 : 0 },
                ...(sm && {
                  "&, [class^=MuiDataGrid]": {
                    "--DataGrid-rowBorderColor": "transparent",
                    "--rowBorderColor": "transparent",
                  },
                }),
                "& .MuiDataGrid-footerContainer": {
                  position: "sticky",
                  bottom: bottomBarEnabled ? 80 : 0,
                  py: 1,
                  px: xs ? 2 : 0,
                  borderTop: (t) => `1px solid ${t.palette.divider}`,
                  bgcolor: "background.paper",
                  "& .MuiToolbar-root": { px: 0 },
                  "& .MuiTablePagination-spacer": { display: "none" },
                },
                ...rest.sx,
              }}
              columns={map(
                sm ? filter(columns, (c) => !c.fold) : columns,
                (c) => ({
                  type: "string",
                  field: "",
                  headerName: "",
                  sortable: false,
                  align: "left",
                  headerAlign: "left",
                  cellClassName: center,
                  ...c,
                })
              )}
              rows={filter(
                input ? fuse.search(input).map((r) => r.item) : rows,
                shouldIncludeItem
              )}
            />
          </DataGridContext.Provider>
        </>
      )}
    </Stack>
  );
}
