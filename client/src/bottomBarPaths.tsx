import {
  HomeFilledOutlined,
  HomeOutlined,
  SettingsFilledOutlined,
  SettingsOutlined,
} from "@mui-symbols-material/w400";

export const bottomBarPaths = [
  {
    label: "Home",
    url: "/",
    icon: <HomeOutlined />,
    iconSelected: <HomeFilledOutlined />,
  },
  {
    label: "Settings",
    url: "/manage",
    icon: <SettingsOutlined />,
    iconSelected: <SettingsFilledOutlined />,
  },
];
