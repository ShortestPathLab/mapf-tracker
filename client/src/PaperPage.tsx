import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Toolbar from "@mui/material/Toolbar";
import { Link, Tooltip } from "@mui/material";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useState } from "react";
import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import "./BibTex.css"; // Import the CSS file for styling
import ClipboardJS from "clipboard";
import Divider from "@mui/material/Divider";

const bibtexEntry = `@misc{MAPF_Tracker,
  doi = {10.48550/arXiv.2305.08446},
  url = {https://arxiv.org/abs/2305.08446},
  author = {Bojie Shen and Zhe Chen and Muhammad Aamir Cheema and Daniel D. Harabor and Peter J. Stuckey}, 
  title = {Tracking Progress in Multi-Agent Path Finding}, 
  publisher = {arXiv},
  year = {2023}
}`;
export default function PaperPage() {
  const item_width = 300;
  const [copySuccess, setCopySuccess] = useState(false);
  const handleCopyClick = () => {
    const copyButton = document.createElement("button");
    copyButton.setAttribute("data-clipboard-text", bibtexEntry);

    const clipboard = new ClipboardJS(copyButton);

    clipboard.on("success", () => {
      setCopySuccess(true);
      clipboard.destroy();
    });

    clipboard.on("error", (e) => {
      console.error("Failed to copy BibTeX code:", e);
      clipboard.destroy();
    });

    copyButton.click();
  };

  return (
    <Box sx={{ mx: "auto", maxWidth: 960 }}>
      <Paper sx={{ width: "100%", mt: 2, mb: 2 }}>
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
            Papers and Resources
          </Typography>
        </Toolbar>
        <Divider />
        <Box
          sx={{
            paddingTop: "15px",
            paddingLeft: "35px",
            paddingRight: "35px",
            paddingBottom: "35px",
          }}
        >
          <Typography sx={{ fontSize: 16, flex: "1 1 100%" }} component="div">
            This web platform is presented at ICAPS 2023 system demo track:
          </Typography>
          <ul>
            <Typography sx={{ fontSize: 16, flex: "1 1 100%" }} component="li">
              The paper can be accessed at{" "}
              <Link href="https://icaps23.icaps-conference.org">here</Link>.
            </Typography>
            <Typography sx={{ fontSize: 16, flex: "1 1 100%" }} component="li">
              A demo video giving an overview of the system is also available at{" "}
              <Link href="http://tracker.pathfinding.ai/systemDemo"> here</Link>
              .
            </Typography>
          </ul>

          <Typography
            sx={{ fontSize: 16, flex: "1 1 100%" }}
            variant="h6"
            component="div"
          >
            A full length manuscript is available at{" "}
            <Link href="https://arxiv.org/abs/2305.08446">arXiv</Link>. When
            using our website, please cite the following:
          </Typography>
          <div className="paper-content">
            <div className="code-viewer">
              {bibtexEntry}
              <div className="copy-button-container">
                {copySuccess && (
                  <span className="copy-success-message">
                    Copied to clipboard!
                  </span>
                )}
                <Tooltip title="Click to Copy" placement="top" arrow>
                  <button className="copy-button" onClick={handleCopyClick}>
                    <FileCopyIcon />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </Box>
      </Paper>
    </Box>
  );
}
