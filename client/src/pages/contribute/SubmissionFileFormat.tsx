import { ExpandMoreOutlined } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

export function SubmissionFileFormat() {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreOutlined />}
        sx={{ px: 0, py: 2 }}
      >
        <Typography variant="h6">File format</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0 }}>
        <Box>
          <Typography
            sx={{ fontSize: 16, flex: "1 1 100%" }}
            component="div"
            gutterBottom
          >
            File header:
          </Typography>
          <Typography
            sx={{
              fontSize: 16,
              paddingLeft: "15px",
              paddingBottom: "15px",
              flex: "1 1 100%",
            }}
            component="div"
            gutterBottom
          >
            map_name, scen_type, type_id, agents, lower_cost, solution_cost,
            solution_plan
          </Typography>
          <Typography
            sx={{ fontSize: 16, flex: "1 1 100%" }}
            component="div"
            gutterBottom
          >
            Solution Plan Format:
          </Typography>
          <Typography
            sx={{
              fontSize: 16,
              paddingLeft: "15px",
              paddingBottom: "15px",
              flex: "1 1 100%",
            }}
            component="div"
            gutterBottom
          >
            For each agent, we use a motion string to represent the path, where
            the symbol 'u', 'd', 'l' and 'r' represents moving up, down, left
            and right respectively, and 'w' represents waiting at its current
            location (eg., a path [(0,0) -&gt; (0,1) -&gt; (1,1) -&gt; (2,1)
            -&gt; (2,0) -&gt; (2,0) -&gt; (1,0)] is converted to a motion string
            "drruwl"). We use "\n" to separate the paths between different
            agents.
          </Typography>
          <Typography
            sx={{
              fontSize: 16,
              paddingLeft: "15px",
              paddingBottom: "15px",
              flex: "1 1 100%",
            }}
          >
            Note that coordinates should be using pixel origin, i.e. (0, 0) is
            in the top left corner of the map. This means that an agent with an
            increasing y-coordinate is going down.
          </Typography>
          <Typography
            sx={{
              fontSize: 16,
              paddingLeft: "15px",
              paddingBottom: "15px",
              flex: "1 1 100%",
            }}
          >
            Solution plans should be run-length encoded before submission to
            keep file size low. Please encode single actions as "a" rather than
            as "1a"
          </Typography>
          <Typography
            sx={{ fontSize: 16, flex: "1 1 100%" }}
            component="div"
            gutterBottom
          >
            Example File:
          </Typography>

          <TableContainer sx={{ width: "100%" }}>
            <Table sx={{ width: "100%" }} style={{ tableLayout: "auto" }}>
              <colgroup>
                <col style={{ minWidth: "50px" }} width="10%" />
                <col style={{ minWidth: "50px" }} width="10%" />
                <col style={{ minWidth: "50px" }} width="10%" />
                <col style={{ minWidth: "50px" }} width="10%" />
                <col style={{ minWidth: "50px" }} width="10%" />
                <col style={{ minWidth: "50px" }} width="10%" />
                <col style={{ minWidth: "200px" }} width="40%" />
              </colgroup>
              <TableHead>
                <TableRow>
                  <TableCell>map_name</TableCell>
                  <TableCell>scen_type</TableCell>
                  <TableCell>type_id</TableCell>
                  <TableCell>agents</TableCell>
                  <TableCell>lower_cost</TableCell>
                  <TableCell>solution_cost</TableCell>
                  <TableCell>solution_plan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>empty-32-32</TableCell>
                  <TableCell>even</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>14</TableCell>
                  <TableCell>14</TableCell>
                  <TableCell>u2ru3r3u4r</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>empty-32-32</TableCell>
                  <TableCell>even</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>2</TableCell>
                  <TableCell>38</TableCell>
                  <TableCell>38</TableCell>
                  <TableCell>
                    u2ru3r3u4r
                    <br />
                    2dr2d3r2dr2drd2rdr5d
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>empty-32-32</TableCell>
                  <TableCell>even</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>3</TableCell>
                  <TableCell>50</TableCell>
                  <TableCell>50</TableCell>
                  <TableCell>
                    u2ru3r3u4r <br />
                    2dr2d3r2dr2drd2rdr5d
                    <br />
                    12d
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
