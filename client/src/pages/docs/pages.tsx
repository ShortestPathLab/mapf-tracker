import {
  AnimationOutlined,
  BookOutlined,
  FileDownloadOutlined,
  FileUploadOutlined,
} from "@mui/icons-material";

export const pages = [
  {
    label: "Watch our system demo",
    url: "/systemDemo",
    icon: <AnimationOutlined />,
    description: "Take 5 minutes to watch our ICAPS 2023 system demonstration",
  },
  {
    label: "Submission instructions",
    url: "/",
    icon: <FileUploadOutlined />,
    description:
      "Have MAPF instances to submit? Follow these instructions to submit them",
  },
  {
    label: "Get the dataset",
    url: "/download",
    icon: <FileDownloadOutlined />,
    description: "Learn how to download the dataset",
  },
  {
    label: "About",
    url: "/about",
    icon: <BookOutlined />,
    description: "About this project",
  },
];
