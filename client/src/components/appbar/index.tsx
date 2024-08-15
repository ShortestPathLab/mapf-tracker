import {
  AnimationOutlined,
  CodeOutlined,
  DarkModeOutlined,
  FileDownloadOutlined,
  FileUploadOutlined,
  GitHub,
  InfoOutlined,
  LightModeOutlined,
  MenuOutlined,
  PersonOutlined,
  SortOutlined,
  StackedLineChartOutlined,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Button,
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
import { useMd } from "../dialog/useSmallDisplay";
import { LogInDialog } from "./LogInDialog";
import { UserDialog, getAvatar } from "./UserDialog";

const drawerWidth = 320;

export const appbarHeight = (sm?: boolean) => (sm ? 56 : 64);

export default function index() {
  const md = useMd();
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
        { label: "Github", url: "/", icon: <GitHub /> },
      ],
    },
    {
      grow: true,
      items: [
        {
          primary: true,
          label: "Make a submission",
          url: "/contributes",
          icon: <FileUploadOutlined />,
        },
      ],
    },
    {
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
        {(state) => (
          <>
            <AppBar
              sx={{
                color: "text.primary",
                boxShadow: "none",
              }}
              position="fixed"
            >
              <Toolbar
                sx={{
                  bgcolor: "background.paper",
                }}
              >
                {md && (
                  <IconButton
                    edge="start"
                    sx={{ mr: 1 }}
                    {...bindTrigger(state)}
                  >
                    <MenuOutlined />
                  </IconButton>
                )}
                <Typography variant="h6" sx={{ mr: 2 }}>
                  {appName}
                </Typography>
                {!md && (
                  <Stack
                    direction="row"
                    sx={{ flex: 1, gap: 1, alignItems: "center" }}
                  >
                    {groups.map(({ items, grow }) => (
                      <>
                        {grow ? (
                          <Box sx={{ flexGrow: 1 }} />
                        ) : (
                          <Divider
                            sx={{ mx: 1 }}
                            flexItem
                            orientation="vertical"
                          />
                        )}
                        {items.map(
                          ({
                            label,
                            icon,
                            url,
                            action,
                            iconButton,
                            last,
                            avatar,
                            primary,
                          }) =>
                            iconButton ? (
                              <Tooltip title={label}>
                                <IconButton
                                  edge={last ? "end" : undefined}
                                  onClick={clickHandler(url, action)}
                                >
                                  {avatar ?? icon}
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Button
                                sx={{
                                  px: primary ? 2 : 1,
                                  py: 1,
                                  minWidth: "max-content",
                                }}
                                color={primary ? "primary" : "inherit"}
                                variant={primary ? "contained" : "text"}
                                onClick={clickHandler(url, action)}
                              >
                                {label}
                              </Button>
                            )
                        )}
                      </>
                    ))}
                  </Stack>
                )}
              </Toolbar>
            </AppBar>
            <SwipeableDrawer
              onOpen={() => state.open()}
              {...bindMenu(state)}
              elevation={1}
              variant="temporary"
              ModalProps={{ keepMounted: true }}
              sx={{
                display: md ? "block" : "none",
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
              <Stack>
                <Stack sx={{ p: 2 }}>
                  <Typography variant="h6">{appName}</Typography>
                </Stack>
                {groups.map(({ items }, i) => (
                  <>
                    {!!i && <Divider flexItem />}
                    <List>
                      {items.map(({ icon, label, url, action, avatar }) => (
                        <ListItemButton
                          onClick={clickHandler(url, action, state.close)}
                        >
                          <ListItemIcon>{avatar ?? icon}</ListItemIcon>
                          <ListItemText primary={label} />
                        </ListItemButton>
                      ))}
                    </List>
                  </>
                ))}
              </Stack>
            </SwipeableDrawer>
            <Box sx={{ height: appbarHeight(md) }}></Box>
          </>
        )}
      </PopupState>
      {logInDialog}
      {userDialog}
    </>
  );
}
