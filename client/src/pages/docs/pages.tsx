import {
  AnimationOutlined,
  BookOutlined,
  CampaignOutlined,
  FileDownloadOutlined,
  FileUploadOutlined,
} from "@mui/icons-material";
import DemoPage from "./docs-demo.mdx";
import SubmissionInstructionsPage from "./docs-how-to-submit.mdx";
import DatasetPage from "./docs-get-dataset.mdx";
import AboutPage from "./about";
import MotivationsPage from "./docs-motivations.mdx";
import { find } from "lodash";
import { createArticlePage } from "./createArticlePage";

export type Page = ReturnType<typeof pages>[number];

export const submissionInstructions = () =>
  find(pages(), { value: "how-to-submit" });

export const pages = () => [
  createArticlePage({
    key: "system-demo",
    title: "Watch our system demo",
    icon: <AnimationOutlined />,
    content: <DemoPage />,
    description: "Take 5 minutes to watch our ICAPS 2023 system demonstration",
  }),
  createArticlePage({
    key: "motivations",
    title: "Call for submissions",
    icon: <CampaignOutlined />,
    content: <MotivationsPage />,
    description: "Calling for all MAPF researchers to share your work with us",
  }),
  createArticlePage({
    key: "how-to-submit",
    title: "Submitting data to MAPF Tracker",
    icon: <FileUploadOutlined />,
    content: <SubmissionInstructionsPage />,
    description:
      "Quick-start guide on how to submit your results to the platform",
  }),
  createArticlePage({
    key: "dataset",
    title: "Get the dataset",
    icon: <FileDownloadOutlined />,
    content: <DatasetPage />,
    description: "Learn how to download the dataset",
  }),
  {
    label: "About",
    value: "about",
    icon: <BookOutlined />,
    content: <AboutPage />,
    description: "About this project",
  },
];
