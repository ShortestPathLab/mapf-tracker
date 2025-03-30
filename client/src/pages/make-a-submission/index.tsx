import { Router } from "components/Router";
import Landing from "./landing";
import Step1Page from "./step1";
import Step2Page from "./step2";
import Step3Page from "./step3";

const pages = () => [
  {
    value: 1,
    content: <Step1Page />,
    parent: "",
  },
  {
    value: 2,
    content: <Step2Page />,
    parent: 1,
  },
  {
    value: 3,
    content: <Step3Page />,
    parent: 2,
  },
];

export default function MakeASubmissionPage() {
  return (
    <Router
      flat
      fallback
      routes={[
        {
          path: "/submit/",
          parent: "/more",
          content: <Landing />,
        },
        ...pages().map(({ content, value, parent }) => ({
          content,
          path: `/submit/${value}`,
          parent: `/submit/${parent}`,
        })),
      ]}
    />
  );
}
