import {
  BookOutlined,
  ChevronRightOutlined,
  CodeOutlined,
  DarkModeOutlined,
  EmojiEventsOutlined,
  FileUploadOutlined,
  GitHub,
  LightModeOutlined,
  LocationSearchingOutlined,
  PersonOutlined,
  StackedLineChartOutlined,
} from "@mui/icons-material";
import {
  AppBar,
  AppBarProps,
  Avatar,
  Box,
  Collapse,
  Divider,
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
import { appIconUrl, appName } from "core/config";
import { useDialog } from "hooks/useDialog";
import { useNavigate } from "hooks/useNavigation";
import PopupState, { bindMenu } from "material-ui-popup-state";
import { ReactNode } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { useMode } from "utils/ThemeProvider";
import { useCredentials } from "../../queries/useLogInQuery";
import { useLg } from "../dialog/useSmallDisplay";
import { LogInDialog } from "./LogInDialog";
import { UserDialog, getAvatar } from "./UserDialog";

const drawerWidth = 320;

export const appbarHeight = (md?: boolean) => (md ? 56 : 64);

export function useNavigationContent() {
  const [mode, toggleMode] = useMode();
  const { open: showLogIn, dialog: logInDialog } = useDialog(LogInDialog, {
    title: "Log in",
    slotProps: { modal: { variant: "default" } },
    padded: true,
  });
  const { open: showUserDialog, dialog: userDialog } = useDialog(UserDialog, {
    title: "Account info",
    slotProps: { modal: { variant: "default" } },
    padded: true,
  });
  const { data: credentials } = useCredentials();
  const groups: {
    grow?: boolean;
    label?: string;
    defaultOpen?: boolean;
    items: {
      description?: string;
      primary?: boolean;
      iconButton?: boolean;
      label?: string;
      avatar?: ReactNode;
      url?: string;
      icon?: ReactNode;
      last?: boolean;
      action?: () => void;
    }[];
  }[] = [
    {
      label: "Browse",
      items: [
        {
          label: "Benchmarks",
          url: "/benchmarks",
          icon: <StackedLineChartOutlined />,
          description:
            "View all benchmarks and their top-performing submissions",
        },
        {
          label: "Submissions",
          url: "/submissions",
          icon: <EmojiEventsOutlined />,
          description: "View and compare submitted algorithms",
        },
      ],
    },
    {
      label: "Docs",
      defaultOpen: false,
      items: [
        {
          label: "Docs",
          url: "/docs",
          icon: <BookOutlined />,
          description: "View the documentation",
        },
        {
          label: "Github",
          url: "https://github.com/ShortestPathLab/winter-project-mapf-tracker/tree/main",
          icon: <GitHub />,
          iconButton: true,
          description: "View the source code",
        },
      ],
    },
    {
      label: "Make a submission",
      items: [
        {
          primary: true,
          label: "Request an API key",
          url: "/contributes",
          icon: <FileUploadOutlined />,
          description:
            "If you want to contribute, start by requesting an API key",
        },
        {
          primary: true,
          label: "Manage my submissions",
          url: "/trackSubmission",
          icon: <LocationSearchingOutlined />,
          description:
            "If you have an API key, you can manage your submission here",
        },
      ],
    },

    {
      label: "Manage",
      grow: true,
      items: credentials
        ? [
            {
              iconButton: true,
              label: "Manage this platform",
              icon: <CodeOutlined />,
              url: "/dashboard",
              description:
                "Review submission requests, issue submission keys, and run jobs",
            },
            {
              iconButton: true,
              label: "Account info",
              action: showUserDialog,
              avatar: credentials ? (
                <Avatar
                  sx={{ width: 32, height: 32 }}
                  src={getAvatar(credentials)}
                />
              ) : undefined,
            },
          ]
        : [
            {
              iconButton: true,
              label: "Log in",
              action: showLogIn,
              icon: <PersonOutlined />,
              description: "Log in to manage this platform",
            },
          ],
    },
    {
      label: "Appearance",
      defaultOpen: false,
      items: [
        {
          iconButton: true,
          label: mode === "dark" ? "Light mode" : "Dark mode",
          icon: mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />,
          action: toggleMode,
          last: true,
        },
      ],
    },
  ];
  return { groups, userDialog, logInDialog };
}

export default function index(props: AppBarProps) {
  const lg = useLg();
  const md = useLg();

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
            <Stack
              sx={{
                color: "text.primary",
                minHeight: "100dvh",
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
                        {!!i &&
                          (grow ? (
                            <Box sx={{ flexGrow: 1, minHeight: "10dvh" }} />
                          ) : (
                            <Divider flexItem />
                          ))}
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
                                      color: selected && "primary.main",
                                      px: md ? 2 : 3,
                                      // Looks more comfortable when there's space on the right
                                      pr: 4,
                                    }}
                                    onClick={clickHandler(
                                      url,
                                      action,
                                      state.close
                                    )}
                                  >
                                    <ListItemIcon
                                      sx={{ color: selected && "primary.main" }}
                                    >
                                      {avatar ?? icon}
                                    </ListItemIcon>
                                    <ListItemText primary={label} />
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
                    bgcolor: "background.paper",
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
