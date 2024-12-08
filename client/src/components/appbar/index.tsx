import { ChevronRightOutlined } from "@mui/icons-material";
import {
  AppBar,
  AppBarProps,
  Box,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  SwipeableDrawer,
  Toolbar,
  Typography,
} from "@mui/material";
import { Scroll } from "components/dialog/Scrollbars";
import { appIconUrl, appName } from "core/config";
import { useNavigate } from "hooks/useNavigation";
import PopupState, { bindMenu } from "material-ui-popup-state";
import { matchPath, useLocation } from "react-router-dom";
import { useSm } from "../dialog/useSmallDisplay";
import { useNavigationContent } from "./useNavigationContent";

const drawerWidth = 320;

export const appbarHeight = (md?: boolean) => (md ? 56 : 64);

export default function index(props: AppBarProps) {
  const lg = useSm();
  const md = useSm();

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { groups, userDialog, logInDialog } = useNavigationContent();
  const clickHandler =
    (url?: string, action?: () => void, close?: () => void) => () => {
      if (url) {
        navigate(url);
        close?.();
      } else {
        action?.();
      }
    };
  return (
    <>
      <PopupState variant="popover">
        {(state) => {
          const contents = (
            <Scroll y style={{ height: "100dvh" }}>
              <Stack
                sx={{
                  color: "text.primary",
                  minHeight: "100dvh",
                  minWidth: 260,
                  "> *": { flexShrink: 0 },
                }}
              >
                <Stack sx={{ p: md ? 2 : 3 }}>
                  <Typography variant="h6">{appName}</Typography>
                </Stack>
                {groups.map(({ items, grow, label, defaultOpen = true }, i) => (
                  <PopupState variant="popover" key={label}>
                    {({ isOpen: _isOpen, toggle }) => {
                      const isOpen = defaultOpen ? !_isOpen : _isOpen;
                      return (
                        <>
                          {!!i && grow && (
                            <Box sx={{ flexGrow: 1, minHeight: "10dvh" }} />
                          )}
                          {label && (
                            <Stack
                              onClick={toggle}
                              direction="row"
                              sx={{
                                px: md ? 2 : 3,
                                py: 1,
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                sx={{ flexGrow: 1 }}
                                color="text.secondary"
                                variant="overline"
                              >
                                {label}
                              </Typography>
                              <IconButton
                                edge="end"
                                sx={{ color: "text.secondary" }}
                              >
                                <ChevronRightOutlined
                                  fontSize="small"
                                  sx={{
                                    transition: (t) =>
                                      t.transitions.create("transform"),
                                    transform: isOpen
                                      ? "rotate(90deg)"
                                      : "rotate(0deg)",
                                  }}
                                />
                              </IconButton>
                            </Stack>
                          )}
                          <Collapse in={isOpen}>
                            <List sx={{ mt: label ? -1 : 0 }}>
                              {items.map(
                                ({ icon, label, url, action, avatar }) => {
                                  const selected =
                                    url && !!matchPath(`${url}/*`, pathname);
                                  return (
                                    <ListItemButton
                                      key={label}
                                      selected={selected}
                                      sx={{
                                        borderRadius: 2,
                                        mx: md ? 1 : 1.5,
                                        color: selected && "primary.main",
                                        px: md ? 1 : 1.5,
                                        // Looks more comfortable when there's space on the right
                                        pr: 3,
                                      }}
                                      onClick={clickHandler(
                                        url,
                                        action,
                                        state.close
                                      )}
                                    >
                                      <ListItemIcon
                                        sx={{
                                          color: selected && "primary.main",
                                        }}
                                      >
                                        {avatar ?? icon}
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={label}
                                        sx={{ color: "text.primary" }}
                                      />
                                    </ListItemButton>
                                  );
                                }
                              )}
                            </List>
                          </Collapse>
                        </>
                      );
                    }}
                  </PopupState>
                ))}
              </Stack>
            </Scroll>
          );
          return (
            <>
              {lg && (
                <Box>
                  <AppBar
                    {...props}
                    position="absolute"
                    sx={{
                      bgcolor: "background.default",
                      color: "text.primary",
                      boxShadow: "none",
                      backgroundImage: "none",
                      ...props.sx,
                    }}
                  >
                    <Toolbar
                      sx={{
                        bgcolor: "transparent",
                        height: appbarHeight(md),
                      }}
                    >
                      <Box
                        component="img"
                        sx={{ height: 24, width: 24 }}
                        src={appIconUrl}
                      />
                      <Typography variant="h6" sx={{ ml: 2 }}>
                        {appName}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                </Box>
              )}
              {!lg && (
                <Box
                  sx={{
                    bgcolor: "background.default",
                    minWidth: "fit-content",
                    borderRight: (t) => `1px solid ${t.palette.divider}`,
                  }}
                >
                  {contents}
                </Box>
              )}
              <SwipeableDrawer
                onOpen={() => state.open()}
                {...bindMenu(state)}
                elevation={1}
                variant="temporary"
                ModalProps={{ keepMounted: true }}
                sx={{
                  display: lg ? "block" : "none",
                  "& .MuiDrawer-paper": {
                    borderRadius: (t) =>
                      `0 ${t.shape.borderRadius}px ${t.shape.borderRadius}px 0`,
                    boxSizing: "border-box",
                    width: drawerWidth,
                    maxWidth: "90vw",
                    bgcolor: "background.paper",
                    backgroundImage: "none",
                  },
                }}
              >
                {contents}
              </SwipeableDrawer>
            </>
          );
        }}
      </PopupState>
      {logInDialog}
      {userDialog}
    </>
  );
}
