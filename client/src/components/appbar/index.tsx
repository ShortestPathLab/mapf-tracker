import { ChevronRightRounded } from "@mui-symbols-material/w400";
import {
  alpha,
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
import { appIconUrl, appNameShort } from "core/config";
import { useNavigate } from "hooks/useNavigation";
import PopupState from "material-ui-popup-state";
import { matchPath, useLocation } from "react-router-dom";
import { useCss } from "react-use";
import { useOptions } from "utils/OptionsProvider";
import { useMd, useXs } from "../dialog/useSmallDisplay";
import { useNavigationContent } from "./useNavigationContent";

const drawerWidth = 320;

export const appbarHeight = (md?: boolean) => (md ? 56 : 64);

export default function index(props: AppBarProps) {
  const xs = useXs();
  const md = useMd();

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [{ hideSidebar, sidebarOpenMobile }, setOptions] = useOptions();
  const { groups, userDialog, logInDialog } = useNavigationContent();
  const clickHandler =
    (url?: string, action?: () => void, close?: () => void) => () => {
      if (url) {
        const same = url === pathname;
        navigate(url, {}, { reason: same ? "top" : "appbar" });
        close?.();
        setOptions({ sidebarOpenMobile: false });
      } else {
        action?.();
      }
    };
  const c = useCss({});
  return (
    <>
      <PopupState variant="popover">
        {(state) => {
          const contents = (
            <Scroll y style={{ height: "100%" }}>
              <Stack
                sx={{
                  color: "text.primary",
                  minHeight: "100%",
                  minWidth: 260,
                  "> *": { flexShrink: 0 },
                }}
              >
                <Stack sx={{ p: 3 }}>
                  <Typography variant="h6">{appNameShort}</Typography>
                </Stack>
                {groups.map(({ items, grow, label, defaultOpen = true }, i) => (
                  <PopupState variant="popover" key={label}>
                    {({ isOpen: _isOpen, toggle }) => {
                      const isOpen = defaultOpen ? !_isOpen : _isOpen;
                      return (
                        <>
                          {!!i && grow && <Box sx={{ flexGrow: 1 }} />}
                          <Stack
                            sx={{
                              [`& .${c}`]: { opacity: isOpen ? 0 : 1 },
                              [`&:hover .${c}`]: { opacity: 1 },
                            }}
                          >
                            {label && (
                              <Stack
                                onClick={toggle}
                                direction="row"
                                sx={{
                                  WebkitTapHighlightColor: "transparent",
                                  cursor: "pointer",
                                  px: 3,
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
                                  <ChevronRightRounded
                                    className={c}
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
                              <List sx={{ mt: label ? -2 : 0 }}>
                                {items.map(
                                  (
                                    {
                                      icon,
                                      selectedIcon,
                                      label,
                                      url,
                                      action,
                                      avatar,
                                    },
                                    i
                                  ) => {
                                    const selected =
                                      url && !!matchPath(`${url}/*`, pathname);
                                    return (
                                      <ListItemButton
                                        key={i}
                                        selected={selected}
                                        sx={{
                                          borderRadius: 1,
                                          mx: 1.5,
                                          color: selected && "primary.main",
                                          px: 1,
                                          // Looks more comfortable when there's space on the right
                                          pr: 3,
                                          py: 0.5,
                                          bgcolor: "transparent",
                                          "&.Mui-selected": {
                                            bgcolor: (t) =>
                                              alpha(
                                                t.palette.text.primary,
                                                0.05
                                              ),
                                          },
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
                                            minWidth: 48,
                                            mr: -1,
                                            transform: "scale(0.9)",
                                          }}
                                        >
                                          {avatar ??
                                            (selected
                                              ? selectedIcon ?? icon
                                              : icon)}
                                        </ListItemIcon>
                                        <ListItemText
                                          primary={
                                            <Box
                                              component="span"
                                              sx={{
                                                fontWeight: 450,
                                                fontSize: xs
                                                  ? undefined
                                                  : "0.9rem",
                                                color: "text.primary",
                                                opacity: 0.8,
                                              }}
                                            >
                                              {label}
                                            </Box>
                                          }
                                        />
                                      </ListItemButton>
                                    );
                                  }
                                )}
                              </List>
                            </Collapse>
                          </Stack>
                        </>
                      );
                    }}
                  </PopupState>
                ))}
                <Stack sx={{ height: (t) => t.spacing(1) }} />
              </Stack>
            </Scroll>
          );

          return (
            <>
              {xs ? (
                <Box>
                  <AppBar
                    {...props}
                    position="absolute"
                    sx={{
                      bgcolor: "background.default",
                      color: "text.primary",
                      boxShadow: "none",
                      backgroundImage: "none",
                      border: "none",
                      ...props.sx,
                    }}
                  >
                    <Toolbar
                      sx={{
                        bgcolor: "transparent",
                        height: appbarHeight(xs),
                      }}
                    >
                      <Box
                        component="img"
                        sx={{ height: 24, width: 24 }}
                        src={appIconUrl}
                      />
                      <Typography variant="h6" sx={{ ml: 2 }}>
                        {appNameShort}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                </Box>
              ) : md ? (
                <></>
              ) : (
                <Collapse in={!hideSidebar} orientation="horizontal">
                  <Box
                    sx={{
                      bgcolor: "background.default",
                      minWidth: 280,
                      height: "100%",
                    }}
                  >
                    {contents}
                  </Box>
                </Collapse>
              )}

              <SwipeableDrawer
                open={sidebarOpenMobile}
                onOpen={() =>
                  setOptions({ hideSidebar: false, sidebarOpenMobile: true })
                }
                onClose={() =>
                  setOptions({ hideSidebar: true, sidebarOpenMobile: false })
                }
                elevation={1}
                variant="temporary"
                ModalProps={{ keepMounted: true }}
                sx={{
                  display: md ? "block" : "none",
                  "& .MuiDrawer-paper": {
                    borderRadius: 2,
                    m: 1,
                    height: (t) => `calc(100dvh - ${t.spacing(2)})`,
                    boxSizing: "border-box",
                    width: drawerWidth,
                    maxWidth: "90vw",
                    bgcolor: "background.default",
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
