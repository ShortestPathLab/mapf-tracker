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
  PersonRounded,
  TableFilledRounded,
  TableRounded,
  UploadRounded,
} from "@mui-symbols-material/w400";
import { GitHub } from "@mui/icons-material";
import { useSurface } from "components/surface";
import { ReactNode } from "react";
import { useOptions } from "utils/OptionsProvider";
import { useMode } from "utils/ThemeProvider";
import { useCredentials } from "../../queries/useLogInQuery";
import { LogInDialog } from "./LogInDialog";
import { UserDialog } from "./UserDialog";

export function useNavigationContent() {
  const [mode, toggleMode] = useMode();
  const [options, setOptions] = useOptions();
  const { open: showLogIn, dialog: logInDialog } = useSurface(LogInDialog, {
    title: "Sudo",
  });
  const { open: showUserDialog, dialog: userDialog } = useSurface(UserDialog, {
    title: "Account info",
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
      labelShort?: string;
      label?: string;
      avatar?: ReactNode;
      url?: string;
      icon?: ReactNode;
      selectedIcon?: ReactNode;
      showAsIcon?: boolean;
      last?: boolean;
      action?: () => void;
    }[];
  }[] = [
    {
      label: "Browse",
      defaultOpen: true,
      items: [
        {
          label: "Home",
          url: "/",
          icon: <HomeRounded />,
          selectedIcon: <HomeFilledRounded />,
          description: "",
          showAsIcon: true,
        },
        {
          label: "Benchmarks",
          url: "/benchmarks",
          icon: <TableRounded />,
          selectedIcon: <TableFilledRounded />,
          description:
            "View all benchmarks and their top-performing submissions",
          showAsIcon: true,
        },
        {
          label: "Submissions",
          url: "/submissions",
          icon: <ConversionPathRounded />,
          selectedIcon: <ConversionPathFilledRounded />,
          description: "View and compare submitted algorithms",
          showAsIcon: true,
        },
      ],
    },
    {
      label: "Make a submission",
      defaultOpen: true,
      items: [
        {
          primary: true,
          label: "New submission request",
          url: "/submit",
          icon: <AddRounded />,
          labelShort: "Request",
          selectedIcon: <AddFilledRounded />,
          description:
            "If you want to contribute, start by requesting an API key",
        },
        {
          primary: true,
          label: "Submissions and API keys",
          labelShort: "Keys",
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
      defaultOpen: true,
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
          description: options.hideTips
            ? "See helpful messages as you navigate around the app"
            : "Hide helpful messages",
          icon: options.hideTips ? <LightbulbRounded /> : <LightOffRounded />,
          action: () => setOptions({ hideTips: !options.hideTips }),
          last: true,
        },
      ],
    },
    {
      label: "More",
      defaultOpen: false,
      items: [
        ...(credentials
          ? [
              {
                iconButton: true,
                label: "Sudo",
                icon: <LockOpenRounded />,
                url: "/sudo",
                description:
                  "Review submission requests, issue submission keys, and run jobs",
              },
              {
                iconButton: true,
                label: "Account info",
                action: showUserDialog,
                icon: credentials ? <PersonRounded /> : undefined,
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
