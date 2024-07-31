import { ExpandMoreOutlined } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function CallForSubmission() {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreOutlined />}
        sx={{ px: 0, py: 2 }}
      >
        <Typography variant="h6">
          Why are we benchmarking pathfinding algorithms?
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0 }}>
        <Box>
          <Typography variant="body1">
            In recent years, the number of publications on the topic of MAPF has
            exploded as industrial interest continues to grow. Many works now
            appear across various venues, and substantial performance
            improvements have been achieved. As a community, it is important for
            us to track the progress made in the field and establish the
            state-of-the-art together. Therefore this web-based platform is
            developed to track different types of algorithms and their progress.
            The two important results we collected from different MAPF
            algorithms are:
          </Typography>

          <ul>
            <Typography variant="body1" component="li" gutterBottom>
              Best (i.e., largest) lower-bound value.
            </Typography>
            <Typography variant="body1" component="li" gutterBottom>
              Best (i.e., smallest SIC) solution and its concrete plan.
            </Typography>
          </ul>
          <Typography variant="body1" component="div" gutterBottom>
            To contribute new results, please modify your solver to return the
            CSV file in accordance with the Submission File Format, following
            the instructions provided below:
          </Typography>
          <ul>
            <Typography variant="body1" component="li" gutterBottom>
              For the solver that explores only feasible solutions, please
              report the lower-bound as empty.
            </Typography>
            <Typography variant="body1" component="li" gutterBottom>
              For the solver that attempts to prove optimality, please report
              the lower-bound value when the solver times out.
            </Typography>
          </ul>
          <Typography variant="body1" component="div" gutterBottom>
            To upload your results to the platform:
          </Typography>
          <ul>
            <Typography variant="body1" component="li" gutterBottom>
              If you are interested in submitting results for a particular map:
            </Typography>
            <ul>
              <Typography variant="body1" component="li" gutterBottom>
                Please contact one of the organizers, and we will create an
                account for you.
              </Typography>
              <Typography variant="body1" component="li" gutterBottom>
                Once you have an account, you can contribute/upload-yourself
                individual solutions.
              </Typography>
            </ul>
            <Typography variant="body1" component="li" gutterBottom>
              If you want to contribute a large number of results:
            </Typography>
            <ul>
              <Typography variant="body1" component="li" gutterBottom>
                please contact us and we can organise an mass-upload facility.
              </Typography>
            </ul>
          </ul>
          <Typography variant="body1" component="div" gutterBottom>
            Current Contactor:
          </Typography>
          <ul>
            <Typography variant="body1" component="li" gutterBottom>
              For submission, please contact Bojie.Shen@monash.edu or
              Zhe.Chen@monash.edu.
            </Typography>
          </ul>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
