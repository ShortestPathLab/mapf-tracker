import { Card } from "@mui/material";
import Typography from "@mui/material/Typography";
import { Prose } from "layout";
import Accordion from "components/Accordion";
import CallForSubmissionContent from "./callForSubmission.md";
import Faq from "./faq.md";
import Format from "./format.mdx";
import { useSm } from "components/dialog/useSmallDisplay";

export function Info() {
  const sm = useSm();
  return (
    <Card
      elevation={0}
      sx={{
        p: sm ? 2 : 3,
        flex: 1,
        minWidth: 0,
        // Special case for accordion
        pb: 0,
        pt: 0,
      }}
    >
      {[
        {
          title: "Why are we benchmarking pathfinding algorithms?",
          content: <CallForSubmissionContent />,
        },
        {
          title: "Frequently asked questions",
          content: <Faq />,
        },
        {
          title: "Submission format",
          content: <Format />,
        },
      ].map(({ title, content }) => (
        <Accordion label={title}>
          <Prose sx={{ mt: -2, overflow: "hidden" }}>{content}</Prose>
        </Accordion>
      ))}
    </Card>
  );
}
