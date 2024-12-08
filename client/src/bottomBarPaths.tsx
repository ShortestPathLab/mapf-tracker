import {
  Home,
  HomeOutlined,
  Settings,
  SettingsOutlined,
} from "@mui/icons-material";

export const bottomBarPaths = [
  {
    label: "Home",
    url: "/",
    icon: <HomeOutlined />,
    iconSelected: <Home />,
  },
  {
    label: "Settings",
    url: "/manage",
    icon: <SettingsOutlined />,
    iconSelected: <Settings />,
  },
];
