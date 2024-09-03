import {
  AnimationOutlined,
  CodeOutlined,
  DarkModeOutlined,
  FileDownloadOutlined,
  FileUploadOutlined,
  GitHub,
  InfoOutlined,
  LightModeOutlined,
  LocationSearchingOutlined,
  MenuOutlined,
  PersonOutlined,
  RouteOutlined,
  SortOutlined,
  StackedLineChartOutlined,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  SwipeableDrawer,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { appName } from "core/config";
import { useDialog } from "hooks/useDialog";
import { useNavigate } from "hooks/useNavigation";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { ReactNode } from "react";
import { useMode } from "utils/ThemeProvider";
import { useCredentials } from "../../queries/useLogInQuery";
import { useLg } from "../dialog/useSmallDisplay";
import { LogInDialog } from "./LogInDialog";
import { UserDialog, getAvatar } from "./UserDialog";
import { matchPath, useLocation } from "react-router-dom";

const drawerWidth = 320;

export const appbarHeight = (md?: boolean) => (md ? 56 : 64);

export default function index() {
  const lg = useLg();
  const md = useLg();

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mode, toggleMode] = useMode();
  const { open: showLogIn, dialog: logInDialog } = useDialog(LogInDialog, {
    title: "Log in",
    padded: true,
  });
  const { open: showUserDialog, dialog: userDialog } = useDialog(UserDialog, {
    title: "Account info",
    padded: true,
  });
  const { data: credentials } = useCredentials();
  const groups: {
    grow?: boolean;
    items: {
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
      items: [
        {
          label: "Benchmarks",
          url: "/benchmarks",
          icon: <StackedLineChartOutlined />,
        },
        {
          label: "Submissions",
          url: "/submissions",
          icon: <SortOutlined />,
        },
      ],
    },
    {
      items: [
        {
          label: "Demo",
          url: "/systemDemo",
          icon: <AnimationOutlined />,
        },
        { label: "Dataset", url: "/download", icon: <FileDownloadOutlined /> },
        { label: "About", url: "/about", icon: <InfoOutlined /> },
        {
          label: "Github",
          url: "https://github.com/ShortestPathLab/winter-project-mapf-tracker/tree/main",
          icon: <GitHub />,
          iconButton: true,
        },
      ],
    },
    {
      items: [
        {
          primary: true,
          label: "Make a submission",
          url: "/contributes",
          icon: <FileUploadOutlined />,
        },
        {
          primary: true,
          label: "Track my submission",
          url: "/trackSubmission",
          icon: <LocationSearchingOutlined />,
        },
      ],
    },
    {
      grow: true,
      items: credentials
        ? [
            {
              iconButton: true,
              label: "Manage this platform",
              icon: <CodeOutlined />,
              url: "/dashboard",
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
            },
          ],
    },
    {
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
            <Stack sx={{ color: "text.primary", minHeight: "100dvh" }}>
              <Stack sx={{ p: md ? 2 : 3 }}>
                <Typography variant="h6">{appName}</Typography>
              </Stack>
              {groups.map(({ items, grow }, i) => (
                <>
                  {!!i &&
                    (grow ? (
                      <Box sx={{ flexGrow: 1 }} />
                    ) : (
                      <Divider flexItem />
                    ))}
                  <List>
                    {items.map(({ icon, label, url, action, avatar }) => {
                      const selected = url && !!matchPath(`${url}/*`, pathname);
                      return (
                        <ListItemButton
                          selected={selected}
                          sx={{
                            color: selected && "primary.main",
                            px: md ? 2 : 3,
                            // Looks more comfortable when there's space on the right
                            pr: 4,
                          }}
                          onClick={clickHandler(url, action, state.close)}
                        >
                          <ListItemIcon
                            sx={{ color: selected && "primary.main" }}
                          >
                            {avatar ?? icon}
                          </ListItemIcon>
                          <ListItemText primary={label} />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </>
              ))}
            </Stack>
          );
          return (
            <>
              {lg && (
                <Box>
                  <AppBar
                    sx={{
                      color: "text.primary",
                      boxShadow: "none",
                    }}
                    position="absolute"
                  >
                    <Toolbar
                      sx={{
                        bgcolor: "background.paper",
                        height: appbarHeight(md),
                      }}
                    >
                      {lg && (
                        <IconButton
                          edge="start"
                          sx={{ mr: 1, color: "action" }}
                          {...bindTrigger(state)}
                        >
                          <MenuOutlined />
                        </IconButton>
                      )}
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
                    bgcolor: "background.default",
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
