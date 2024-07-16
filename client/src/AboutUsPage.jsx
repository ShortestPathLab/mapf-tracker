import { Card, Stack } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import * as React from "react";
import "./BibTex.css"; // Import the CSS file for styling
import PageHeader from "./PageHeader";

export default function AboutUs() {
  const item_width = 200;
  return (
    <Stack sx={{ mx: "auto", maxWidth: 960, gap: 4, py: 6 }}>
      <PageHeader current="About" path={[{ name: "MAPF Tracker", url: "/" }]} />
      <Card sx={{ p: 4 }}>
        <Stack sx={{ gap: 2 }}>
          <Typography variant="h4" gutterBottom>
            About this project
          </Typography>
          <Typography>
            Multi-Agent Path Finding (MAPF) is a combinatorial problem that asks
            us to compute collision-free paths for teams of cooperative agents.
            Many works appear on this topic each year, and a large number of
            substantial advancements and improvements have been reported. Yet
            measuring overall progress in MAPF is difficult: there are many
            potential competitors, and the computational burden for
            comprehensive experimentation is prohibitively large. Moreover,
            detailed data from past experimentation is usually unavailable.
          </Typography>
          <Typography>
            This online platform introduces a set of methodological and
            visualisation tools which can help the community establish clear
            indicators for state-of-the-art MAPF performance and which can
            facilitate large-scale comparisons between MAPF solvers. Our
            objectives are to lower the barrier of entry for new researchers and
            to further promote the study of MAPF.
          </Typography>
        </Stack>
      </Card>
      <Card sx={{ p: 4 }}>
        <Typography variant="h4">Advisor board</Typography>

        {/*<Divider variant="middle" style={{ margin: '1rem 0' }} />*/}
        <Box
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(320px, 1fr))",
            paddingTop: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              width={item_width}
            >
              <Avatar
                alt="Daniel Harabor"
                src={"/assets/photo/daniel.jpg"}
                sx={{
                  width: item_width - 100,
                  height: item_width - 100,
                  transform: "scale(0.8)",
                }}
              />
              <Typography
                sx={{
                  fontSize: 16,
                  width: item_width,
                  m: 2,
                  textAlign: "center",
                }}
                id="tableTitle"
                component="div"
              >
                Daniel Harabor (Lab Leader)
              </Typography>
              <Typography
                sx={{
                  fontSize: 16,
                  width: item_width,
                  mb: 2,
                  textAlign: "center",
                }}
                id="tableTitle"
                component="div"
              >
                Associate Professor, Faculty of Information Technology, Monash
                University
              </Typography>
            </Box>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              width={item_width}
            >
              <Avatar
                alt="Peter Stuckey"
                src={"/assets/photo/Peter.jpg"}
                sx={{
                  width: item_width - 100,
                  height: item_width - 100,
                  transform: "scale(0.8)",
                }}
              />

              <Typography
                sx={{
                  fontSize: 16,
                  width: item_width,
                  m: 2,
                  textAlign: "center",
                }}
                id="tableTitle"
                component="div"
              >
                Peter Stuckey
              </Typography>
              <Typography
                sx={{
                  fontSize: 16,
                  width: item_width,
                  mb: 2,
                  textAlign: "center",
                }}
                id="tableTitle"
                component="div"
              >
                Professor, Faculty of Information Technology, Monash University
              </Typography>
            </Box>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              width={item_width}
            >
              <Avatar
                alt="Muhammad Aamir Cheema"
                src={"/assets/photo/Aamir.jpeg"}
                sx={{
                  width: item_width - 100,
                  height: item_width - 100,
                  transform: "scale(0.8)",
                }}
              />
              <Typography
                sx={{
                  fontSize: 16,
                  width: item_width,
                  m: 2,
                  textAlign: "center",
                }}
                id="tableTitle"
                component="div"
              >
                Muhammad Aamir Cheema
              </Typography>
              <Typography
                sx={{
                  fontSize: 16,
                  width: item_width,
                  mb: 2,
                  textAlign: "center",
                }}
                id="tableTitle"
                component="div"
              >
                Associate Professor, Faculty of Information Technology, Monash
                University
              </Typography>
            </Box>
          </div>
        </Box>
      </Card>

      <Card sx={{ p: 4 }}>
        <Typography variant="h4">Developer board</Typography>
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(320px, 1fr))",
            paddingTop: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              width={item_width}
            >
              <Avatar
                alt="Bojie Shen"
                src={"/assets/photo/Bojie.jpg"}
                sx={{
                  width: item_width - 100,
                  height: item_width - 100,
                  transform: "scale(0.8)",
                }}
              />
              <Typography
                sx={{
                  fontSize: 16,
                  width: item_width,
                  m: 2,
                  textAlign: "center",
                }}
                id="tableTitle"
                component="div"
              >
                Bojie Shen
              </Typography>
              <Typography
                sx={{
                  fontSize: 16,
                  width: item_width,
                  mb: 2,
                  textAlign: "center",
                }}
                id="tableTitle"
                component="div"
              >
                Ph.D. Candidate, Monash University
              </Typography>
            </Box>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              width={item_width}
            >
              <Avatar
                alt="Zhe Chen"
                src={"/assets/photo/zhe_chen.jpg"}
                sx={{
                  width: item_width - 100,
                  height: item_width - 100,
                  transform: "scale(0.8)",
                }}
              />
              <Typography
                sx={{
                  fontSize: 16,
                  width: item_width,
                  m: 2,
                  textAlign: "center",
                }}
                id="tableTitle"
                component="div"
              >
                Zhe Chen
              </Typography>
              <Typography
                sx={{
                  fontSize: 16,
                  width: item_width,
                  mb: 2,
                  textAlign: "center",
                }}
                id="tableTitle"
                component="div"
              >
                Ph.D. Candidate, Monash University
              </Typography>
            </Box>
          </div>
        </div>
      </Card>
      {/*<textarea ref={textareaRef} className="hidden-textarea" readOnly value={bibtexEntry} />*/}

      {/*</Paper>*/}
    </Stack>
  );
}
