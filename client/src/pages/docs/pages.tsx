import {
  AnimationRounded,
  BookRounded,
  CampaignRounded,
  DownloadRounded,
  EmojiEventsRounded,
  ShapeLineRounded,
  UploadFileRounded,
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
    icon: <AnimationRounded />,
    content: <DemoPage />,
    description: "Take 5 minutes to watch our ICAPS 2023 system demonstration",
  }),
  createArticlePage({
    key: "motivations",
    title: "Call for submissions",
    icon: <CampaignRounded />,
    content: <MotivationsPage />,
    description: "Calling for all MAPF researchers to share your work with us",
  }),
  createArticlePage({
    key: "problem-definition",
    title: "Problem model",
    icon: <ShapeLineRounded />,
    content: <ProblemDefinitionPage />,
    description: "MAPF Tracker uses the classical MAPF problem model",
  }),
  createArticlePage({
    key: "solution-format",
    title: "Solution format",
    icon: <EmojiEventsRounded />,
    content: <SolutionFormatPage />,
    description: "How do I read or write a solution?",
  }),
  createArticlePage({
    key: "how-to-submit",
    title: "Submitting data to MAPF Tracker",
    icon: <UploadFileRounded />,
    content: <SubmissionInstructionsPage />,
    description:
      "Quick-start guide on how to submit your results to the platform",
  }),
  createArticlePage({
    key: "dataset",
    title: "Get the dataset",
    icon: <DownloadRounded />,
    content: <DatasetPage />,
    description: "Learn how to download the dataset",
  }),
  {
    label: "About",
    value: "about",
    icon: <BookRounded />,
    content: <AboutPage />,
    description: "About this project",
    cover: undefined,
  },
];
