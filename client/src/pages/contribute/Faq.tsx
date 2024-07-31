import { ExpandMoreOutlined } from "@mui/icons-material";
import {
  Stack,
  Toolbar,
  Typography,
  Divider,
  Box,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Link,
} from "@mui/material";
import React from "react";

export default function Faq() {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreOutlined />}
        sx={{ px: 0, py: 2 }}
      >
        <Typography variant="h6">Frequently asked questions</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0 }}>
        <Stack>
          <Box>
            <Typography
              sx={{ fontSize: 16, flex: "1 1 100%" }}
              component="div"
              gutterBottom
            >
              Q1: I did not receive credit for all of my submitted results!
            </Typography>
            <ul>
              <Typography
                sx={{ fontSize: 16, flex: "1 1 100%" }}
                component="li"
                gutterBottom
              >
                We validate all submissions for feasibility and reject any which
                are invalid. If you submit a best-known solution and the
                corresponding plan is invalid, we will not record any data for
                this problem.
              </Typography>
            </ul>
            <Typography
              sx={{ fontSize: 16, flex: "1 1 100%" }}
              component="div"
              gutterBottom
            >
              Q2: The number of claimed lower-bounds for my submission has gone
              down since it was accepted.
            </Typography>
            <ul>
              <Typography
                sx={{ fontSize: 16, flex: "1 1 100%" }}
                component="li"
                gutterBottom
              >
                We compare lower-bound claims against best-known solutions. If
                your lower-bound claim X is contradicted by a feasible solution
                with cost Y &lt; X , your claim is invalid and will be removed.
                In case of such errors we remove all LB claims of the associated
                submission.
              </Typography>
            </ul>
            <Typography
              sx={{ fontSize: 16, flex: "1 1 100%" }}
              component="div"
              gutterBottom
            >
              Q3: Is there a convenient method to download all of this data?
            </Typography>
            <ul>
              <Typography
                sx={{ fontSize: 16, flex: "1 1 100%" }}
                component="li"
                gutterBottom
              >
                Yes! Please visit our{" "}
                <Link href="http://tracker.pathfinding.ai/quickDownload">
                  download page
                </Link>
                . The benchmark folder comprises snapshot files of all scenarios
                from the MovingAI repository, while the result folder houses
                solution plans from the best-known solution. You can
                conveniently download all the ZIP files using the wget command.
              </Typography>
            </ul>
            <Typography
              sx={{ fontSize: 16, flex: "1 1 100%" }}
              component="div"
              gutterBottom
            >
              Q4: I found a problem with the data or the website.
            </Typography>
            <ul>
              <Typography
                sx={{ fontSize: 16, flex: "1 1 100%" }}
                component="li"
                gutterBottom
              >
                Please raise an issue in our issue tracker on{" "}
                <Link href="https://github.com/bshen95/MAPF-benchmark-web">
                  Github
                </Link>
                . Describe the problem with as much detail as possible, and the
                steps leading up to the problem, so that we can reproduce it.
              </Typography>
            </ul>
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
