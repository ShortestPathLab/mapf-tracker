import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { Card, Link, Stack } from "@mui/material";
import "./BibTex.css"; // Import the CSS file for styling
import PageHeader from "./PageHeader";

const bibtexEntry = `@misc{MAPF_Tracker,
  doi       = {10.48550/arXiv.2305.08446},
  url       = {https://arxiv.org/abs/2305.08446},
  author    = {Bojie Shen and Zhe Chen and Muhammad Aamir Cheema and Daniel D. Harabor and Peter J. Stuckey}, 
  title     = {Tracking Progress in Multi-Agent Path Finding}, 
  publisher = {arXiv},
  year      = {2023}
}`;
export default function SystemDemo() {
  return (
    <Stack sx={{ mx: "auto", maxWidth: 960, gap: 4, py: 6 }}>
      <PageHeader
        current="System demo"
        path={[{ name: "MAPF Tracker", url: "/" }]}
      />
      <Paper>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
          }}
        >
          <Typography
            sx={{ flex: "1 1 100%", paddingLeft: "10px" }}
            variant="h6"
            component="div"
          >
            Papers and Demo
          </Typography>
        </Toolbar>
        <Divider />
        <Stack sx={{ gap: 2, p: 4 }}>
          <Typography>
            This web platform is presented at{" "}
            <Link href="https://icaps23.icaps-conference.org">ICAPS 2023</Link>{" "}
            system demo track. That paper can be accessed{" "}
            <Link href="https://icaps23.icaps-conference.org/demos/papers/255_paper.pdf">
              here
            </Link>
            . A full length manuscript is available from{" "}
            <Link href="https://arxiv.org/abs/2305.08446">arXiv</Link>. When
            using our website, please cite the following:
          </Typography>
          <Card variant="outlined" sx={{ p: 4, whiteSpace: "pre-wrap" }}>
            <code>{bibtexEntry}</code>
          </Card>
          <Typography>
            The following video demonstration gives an overview of our system:
          </Typography>
          <Box
            sx={{ aspectRatio: 16 / 9, borderRadius: 1 }}
            component="iframe"
            src="https://www.youtube.com/embed/qtG6-h4FZxU"
            title="Tracking Progress in MAPF - ICAPS 2023 System Demonstration"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></Box>
        </Stack>
      </Paper>
    </Stack>
  );
}
