import {
  AnimationOutlined,
  BookOutlined,
  FileDownloadOutlined,
  FileUploadOutlined,
} from "@mui/icons-material";
import DemoPage from "./demo";
import SubmissionInstructionsPage from "./how-to-submit";
import DatasetPage from "./get-dataset";
import AboutPage from "./about";

export type Page = ReturnType<typeof pages>[number];

export const submissionInstructions = () => ({
  label: "Submitting data to MAPF Tracker",
  value: "how-to-submit",
  icon: <FileUploadOutlined />,
  content: <SubmissionInstructionsPage />,
  description:
    "Quick-start guide on how to submit your results to the platform",
});

export const pages = () => [
  {
    label: "Watch our system demo",
    value: "system-demo",
    icon: <AnimationOutlined />,
    content: <DemoPage />,
    description: "Take 5 minutes to watch our ICAPS 2023 system demonstration",
  },
  submissionInstructions(),
  {
    label: "Get the dataset",
    value: "dataset",
    icon: <FileDownloadOutlined />,
    content: <DatasetPage />,
    description: "Learn how to download the dataset",
  },
  {
    label: "About",
    value: "about",
    icon: <BookOutlined />,
    content: <AboutPage />,
    description: "About this project",
  },
];
