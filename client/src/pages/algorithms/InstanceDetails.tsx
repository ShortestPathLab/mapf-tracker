import { Button, Stack, Typography } from "@mui/material";
import { Dot } from "components/Dot";
import { Item } from "components/Item";
import { DialogContentProps } from "hooks/useDialog";
import { useNavigate } from "hooks/useNavigation";
import { Grid } from "layout";
import { capitalize, startCase } from "lodash";
import { MapLabel } from "pages/submission-summary/table/MapLabel";
import { ScenarioLabel } from "pages/submission-summary/table/ScenarioLabel";
import { useAlgorithmDetailData } from "queries/useAlgorithmQuery";
import { formatDate } from "utils/format";
import { AlgorithmPreview } from "./AlgorithmPreview";
import {
  SubmissionInstanceContextParams,
  SubmissionInstanceContext,
} from "./SubmissionInstanceContextParams";
import { InstanceLabel } from "./InstanceLabel";

export function InstanceDetails({
  scenario,
  index,
  algorithm,
}: SubmissionInstanceContextParams & DialogContentProps) {
  const { data: algorithmInfo } = useAlgorithmDetailData(algorithm);
  const navigate = useNavigate();
  return (
    <SubmissionInstanceContext
      algorithm={algorithm}
      scenario={scenario}
      index={index}
    >
      {({ current, instance }) => {
        return (
          <Stack sx={{ gap: 4, width: 720, maxWidth: "100%" }}>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Algorithm
              </Typography>
              <Item
                icon={<AlgorithmPreview id={algorithm} />}
                primary={algorithmInfo?.algo_name}
                secondary={algorithmInfo?.authors}
              />
            </Stack>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Instance
              </Typography>
              <Stack>
                <MapLabel mapId={instance?.map_id} />
                <ScenarioLabel scenarioId={instance?.scen_id} />
                <InstanceLabel id={instance?.id} />
              </Stack>
            </Stack>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Results
              </Typography>
              <Item
                invert
                primary={formatDate(current?.date)}
                secondary={"Date submitted"}
              />
              <Grid width={120}>
                {["solution_cost", "lower_cost"].map((cost) => (
                  <Item
                    invert
                    key={cost}
                    primary={current?.[cost] ?? "N/A"}
                    secondary={capitalize(startCase(cost))}
                  />
                ))}
              </Grid>
              <Grid width={120}>
                {["best_solution", "best_lower"].map((cost) => (
                  <Item
                    invert
                    key={cost}
                    primary={
                      current?.[cost] ? (
                        <>
                          <Dot sx={{ bgcolor: "success.main" }} />
                          Yes
                        </>
                      ) : (
                        <>
                          <Dot
                            sx={{
                              bgcolor: "warning.main",
                            }}
                          />
                          No
                        </>
                      )
                    }
                    secondary={capitalize(startCase(cost))}
                  />
                ))}
              </Grid>
            </Stack>{" "}
            <Stack sx={{ gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                State-of-the-art for this instance
              </Typography>
              <Grid width={120}>
                {["solution_cost", "lower_cost"].map((cost) => (
                  <Item
                    invert
                    key={cost}
                    primary={instance?.[cost] ?? "N/A"}
                    secondary={capitalize(startCase(cost))}
                  />
                ))}
              </Grid>
            </Stack>
            <Button
              variant="contained"
              onClick={() =>
                navigate("/visualization", {
                  instanceId: instance?.id,
                  solutionId: instance?.solution_path_id,
                  source: "submitted",
                })
              }
            >
              See this instance in benchmarks
            </Button>
          </Stack>
        );
      }}
    </SubmissionInstanceContext>
  );
}
