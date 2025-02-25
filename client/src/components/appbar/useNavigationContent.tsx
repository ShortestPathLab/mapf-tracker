import {
  Add,
  AddOutlined,
  Book,
  BookOutlined,
  CodeOutlined,
  DarkModeOutlined,
  EmojiEvents,
  EmojiEventsOutlined,
  FileUploadOutlined,
  GitHub,
  Home,
  HomeOutlined,
  LightModeOutlined,
  MultilineChartOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import { Avatar } from "@mui/material";
import { useDialog } from "hooks/useDialog";
import { ReactNode } from "react";
import { useMode } from "utils/ThemeProvider";
import { useCredentials } from "../../queries/useLogInQuery";
import { LogInDialog } from "./LogInDialog";
import { UserDialog, getAvatar } from "./UserDialog";

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
      selectedIcon?: ReactNode;
      last?: boolean;
      action?: () => void;
    }[];
  }[] = [
    {
      label: "Browse",
      items: [
        {
          label: "Home",
          url: "/",
          icon: <HomeOutlined />,
          selectedIcon: <Home />,
          description: "",
        },
        {
          label: "Browse",
          url: "/benchmarks",
          icon: <MultilineChartOutlined />,
          description:
            "View all benchmarks and their top-performing submissions",
        },
        {
          label: "Submissions",
          url: "/submissions",
          icon: <EmojiEventsOutlined />,
          selectedIcon: <EmojiEvents />,
          description: "View and compare submitted algorithms",
        },
      ],
    },
    {
      label: "Make a submission",
      items: [
        {
          primary: true,
          label: "New submission request",
          url: "/submit",
          icon: <AddOutlined />,
          selectedIcon: <Add />,
          description:
            "If you want to contribute, start by requesting an API key",
        },
        {
          primary: true,
          label: "Submissions and API keys",
          url: "/track",
          icon: <FileUploadOutlined />,
          description:
            "If you have an API key, you can manage your submission here",
        },
      ],
    },
    {
      label: "Docs",
      defaultOpen: true,
      items: [
        {
          label: "Docs",
          url: "/docs",
          icon: <BookOutlined />,
          selectedIcon: <Book />,
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
      label: "Settings",
      grow: true,
      items: [
        {
          iconButton: true,
          label: mode === "dark" ? "Light mode" : "Dark mode",
          icon: mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />,
          action: toggleMode,
          last: true,
        },
        ...(credentials
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
                label: "Management",
                action: showLogIn,
                icon: <PersonOutlined />,
                description: "Log in to manage this platform",
              },
            ]),
      ],
    },
  ];
  return { groups, userDialog, logInDialog };
}
