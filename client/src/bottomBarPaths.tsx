import {
  HomeFilledRounded,
  HomeRounded,
  SettingsFilledRounded,
  SettingsRounded,
} from "@mui-symbols-material/w400";

export const bottomBarPaths = [
  {
    label: "Home",
    url: "/",
    icon: <HomeRounded />,
    iconSelected: <HomeFilledRounded />,
  },
  {
    label: "Settings",
    url: "/manage",
    icon: <SettingsRounded />,
    iconSelected: <SettingsFilledRounded />,
  },
];
