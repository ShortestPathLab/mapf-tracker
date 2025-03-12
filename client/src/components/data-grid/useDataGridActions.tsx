import { MoreVertRounded } from "@mui-symbols-material/w400";
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Tooltip,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useSm } from "components/dialog/useSmallDisplay";
import { filter, map } from "lodash";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { ReactElement, ReactNode } from "react";

export type DataGridActionsItem<T> = {
  name?: string;
  action?: (row: T) => void;
  icon?: ReactElement;
  hidden?: (row: T) => boolean;
  render?: (row: T, trigger: ReactElement) => ReactNode;
};

export function useDataGridActions<T>({
  items = [],
  menuItems = [],
}: {
  items?: DataGridActionsItem<T>[];
  menuItems?: DataGridActionsItem<T>[];
}): GridColDef<T> {
  const sm = useSm();
  const len = sm ? 0 : items.length + (menuItems.length ? 1 : 0);
  const shownItems = sm ? [] : items;
  const storedItems = sm ? [...items, ...menuItems] : menuItems;
  return {
    flex: 0.5,
    field: "Actions",
    headerName: "",
    align: "right",
    headerAlign: "right",
    minWidth: 48 * (len + 1),
    renderCell: ({ row }) => {
      const filteredShownItems = filter(shownItems, (r) => !r.hidden?.(row));
      const filteredStoredItems = filter(storedItems, (r) => !r.hidden?.(row));
      return (
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {map(
            filteredShownItems,
            ({ name, action, icon, render = (_, c) => c }) => (
              <Box
                sx={{
                  "@media (pointer: fine)": {
                    opacity: 0,
                    "&:is(.MuiDataGrid-row:hover *)": { opacity: 1 },
                  },
                }}
              >
                {render(
                  row,
                  <IconButton onClick={() => action?.(row)}>
                    <Tooltip title={name}>{icon}</Tooltip>
                  </IconButton>
                )}
              </Box>
            )
          )}
          {!!filteredStoredItems?.length && (
            <PopupState variant="popover">
              {(state) => (
                <>
                  <IconButton {...bindTrigger(state)}>
                    <MoreVertRounded />
                  </IconButton>
                  <Menu
                    {...bindMenu(state)}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    <MenuList>
                      {map(
                        filteredStoredItems,
                        ({ name, action, icon, render = (_, c) => c }) =>
                          render(
                            row,
                            <MenuItem
                              onClick={() => {
                                action?.(row);
                                state.close();
                              }}
                            >
                              <ListItemIcon>{icon}</ListItemIcon>
                              <ListItemText>{name}</ListItemText>
                            </MenuItem>
                          )
                      )}
                    </MenuList>
                  </Menu>
                </>
              )}
            </PopupState>
          )}
        </Stack>
      );
    },
  };
}
