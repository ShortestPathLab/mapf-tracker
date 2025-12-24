import {
  AnimationRounded,
  EmojiEventsRounded,
  ShapeLineRounded,
  UploadFileRounded,
} from "@mui-symbols-material/w300";
import { find } from "lodash";
import { createArticlePage } from "./createArticlePage";
import DemoPage from "./docs-demo.mdx";
import SubmissionInstructionsPage from "./docs-how-to-submit.mdx";
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
];
