import {
  Build,
  BuildOutlined,
  FileUploadOutlined,
  Home,
  HomeOutlined,
} from "@mui/icons-material";

export const bottomBarPaths = [
  {
    label: "Browse",
    url: "/",
    icon: <HomeOutlined />,
    iconSelected: <Home />,
  },
  {
    label: "Submit",
    url: "/submit",
    icon: <FileUploadOutlined />,
    iconSelected: <FileUploadOutlined />,
  },
  {
    label: "Manage",
    url: "/manage",
    icon: <BuildOutlined />,
    iconSelected: <Build />,
  },
];
