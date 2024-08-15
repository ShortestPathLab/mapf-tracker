import { MoreVertOutlined } from "@mui/icons-material";
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
import { map } from "lodash";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { ReactElement, ReactNode } from "react";

export type Item<T> = {
  name?: string;
  action?: (row: T) => void;
  icon?: ReactElement;
  render?: (row: T, trigger: ReactElement) => ReactNode;
};

export function makeDataGridActions<T>({
  items = [],
  menuItems = [],
}: {
  items?: Item<T>[];
  menuItems?: Item<T>[];
}): GridColDef<T> {
  const len = items.length + (menuItems.length ? 1 : 0);
  return {
    flex: 1,
    field: "Actions",
    headerName: "",
    align: "right",
    headerAlign: "right",
    minWidth: 48 * len,
    renderCell: ({ row }) => (
      <Stack
        direction="row"
        gap={1}
        alignItems="center"
        onTouchStart={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {map(items, ({ name, action, icon, render = (_, c) => c }) => (
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
        ))}
        {!!menuItems?.length && (
          <PopupState variant="popover">
            {(state) => (
              <>
                <IconButton {...bindTrigger(state)}>
                  <MoreVertOutlined />
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
                      menuItems,
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
    ),
  };
}
