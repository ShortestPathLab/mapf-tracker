import {
  AnimationOutlined,
  BookOutlined,
  CampaignOutlined,
  DownloadOutlined,
  EmojiEventsOutlined,
  ShapeLineOutlined,
  UploadFileOutlined,
} from "@mui-symbols-material/w400";
import { find } from "lodash";
import AboutPage from "./about";
import { createArticlePage } from "./createArticlePage";
import DemoPage from "./docs-demo.mdx";
import DatasetPage from "./docs-get-dataset.mdx";
import SubmissionInstructionsPage from "./docs-how-to-submit.mdx";
import MotivationsPage from "./docs-motivations.mdx";
import ProblemDefinitionPage from "./docs-problem-definition.md";
import SolutionFormatPage from "./docs-solution-format.mdx";

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
    key: "problem-definition",
    title: "Problem definition",
    icon: <ShapeLineOutlined />,
    content: <ProblemDefinitionPage />,
    description: "What exactly is MAPF Tracker tracking?",
  }),
  createArticlePage({
    key: "solution-format",
    title: "Solution format",
    icon: <EmojiEventsOutlined />,
    content: <SolutionFormatPage />,
    description: "How do I read or write a solution?",
  }),
  createArticlePage({
    key: "how-to-submit",
    title: "Submitting data to MAPF Tracker",
    icon: <UploadFileOutlined />,
    content: <SubmissionInstructionsPage />,
    description:
      "Quick-start guide on how to submit your results to the platform",
  }),
  createArticlePage({
    key: "dataset",
    title: "Get the dataset",
    icon: <DownloadOutlined />,
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
