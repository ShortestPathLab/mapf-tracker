import {
  AddFilledRounded,
  AddRounded,
  BookFilledRounded,
  BookRounded,
  ConversionPathFilledRounded,
  ConversionPathRounded,
  DarkModeRounded,
  HomeFilledRounded,
  HomeRounded,
  LightModeRounded,
  LightOffRounded,
  LightbulbRounded,
  LockOpenRounded,
  LockRounded,
  SearchFilledRounded,
  SearchRounded,
  UploadRounded,
} from "@mui-symbols-material/w400";
import { GitHub } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import { useDialog } from "hooks/useDialog";
import { ReactNode } from "react";
import { useOptions } from "utils/OptionsProvider";
import { useMode } from "utils/ThemeProvider";
import { useCredentials } from "../../queries/useLogInQuery";
import { LogInDialog } from "./LogInDialog";
import { UserDialog, getAvatar } from "./UserDialog";

export function useNavigationContent() {
  const [mode, toggleMode] = useMode();
  const [options, setOptions] = useOptions();
  const { open: showLogIn, dialog: logInDialog } = useDialog(LogInDialog, {
    title: "Sudo",
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
          icon: <HomeRounded />,
          selectedIcon: <HomeFilledRounded />,
          description: "",
        },
        {
          label: "Benchmarks",
          url: "/benchmarks",
          icon: <SearchRounded />,
          selectedIcon: <SearchFilledRounded />,
          description:
            "View all benchmarks and their top-performing submissions",
        },
        {
          label: "Submissions",
          url: "/submissions",
          icon: <ConversionPathRounded />,
          selectedIcon: <ConversionPathFilledRounded />,
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
          icon: <AddRounded />,
          selectedIcon: <AddFilledRounded />,
          description:
            "If you want to contribute, start by requesting an API key",
        },
        {
          primary: true,
          label: "Submissions and API keys",
          url: "/track",
          icon: <UploadRounded />,
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
          icon: <BookRounded />,
          selectedIcon: <BookFilledRounded />,
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
      defaultOpen: false,
      items: [
        {
          iconButton: true,
          label: mode === "dark" ? "Light mode" : "Dark mode",
          icon: mode === "dark" ? <LightModeRounded /> : <DarkModeRounded />,
          action: toggleMode,
          last: true,
        },
        {
          iconButton: true,
          label: options.hideTips ? "Show tips" : "Hide tips",
          icon: options.hideTips ? <LightbulbRounded /> : <LightOffRounded />,
          action: () => setOptions({ hideTips: !options.hideTips }),
          last: true,
        },
        ...(credentials
          ? [
              {
                iconButton: true,
                label: "Management",
                icon: <LockOpenRounded />,
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
                label: "Sudo",
                action: showLogIn,
                icon: <LockRounded />,
                description: "Log in to manage this platform",
              },
            ]),
      ],
    },
  ];
  return { groups, userDialog, logInDialog };
}
