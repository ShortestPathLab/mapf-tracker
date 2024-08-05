import { Card } from "@mui/material";
import Typography from "@mui/material/Typography";
import { Prose } from "layout";
import Accordion from "./Accordion";
import CallForSubmissionContent from "./callForSubmission.md";
import Faq from "./faq.md";
import Format from "./format.mdx";

export function Info() {
  return (
    <Card
      elevation={0}
      sx={{
        p: 4,
        flex: 1,
        minWidth: 0,
        // Special case for accordion
        pb: 1,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Call for submissions
      </Typography>
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
        <Accordion title={title}>
          <Prose sx={{ mt: -2, overflow: "hidden" }}>{content}</Prose>
        </Accordion>
      ))}
    </Card>
  );
}
