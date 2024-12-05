import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  timelineItemClasses,
} from "@mui/lab";
import { ListItem, ListItemText, Stack, Typography } from "@mui/material";
import { DetailsList } from "components/DetailsList";
import Grid from "layout/Grid";
import { capitalize, head } from "lodash";
import pluralize from "pluralize";
import { useAlgorithmForInstanceData } from "queries/useAlgorithmQuery";
import { useMapData, useScenarioData } from "queries/useBenchmarksQuery";
import { useInstanceData } from "queries/useInstanceQuery";
import { paper } from "theme";
import { formatDate } from "utils/format";

export default function Details({ id }: { id?: string }) {
  const { data: history } = useAlgorithmForInstanceData(id);
  const { data: instance } = useInstanceData(id);
  const { data: scenario } = useScenarioData(instance?.scen_id);
  const { data: map } = useMapData(instance?.map_id);
  return (
    <Grid gap={4}>
      <Stack sx={paper(0)}>
        <DetailsList
          items={[
            {
              label: "Instance",
              value: pluralize("agent", instance?.agents, true),
            },
            {
              label: "Scenario",
              value: `${scenario?.scen_type}-${scenario?.type_id}`,
            },
            { label: "Map", value: `${map?.map_name}` },
            {
              label: "Status",
              value: capitalize(
                [
                  isFinite(instance?.solution_cost) ? "solved" : "unsolved",
                  isFinite(instance?.solution_cost) &&
                  instance.solution_cost === instance?.lower_cost
                    ? "closed"
                    : "open",
                ].join(", ")
              ),
            },
          ]}
        />
      </Stack>
      <Grid sx={{ gap: 4 }}>
        {[
          {
            name: "Lower-bound record claims",
            collection: head(history)?.lower_algos,
          },
          {
            name: "Solution record claims",
            collection: head(history)?.solution_algos,
          },
        ].map(({ name, collection }) => (
          <Stack key={name} sx={{ gap: 2 }}>
            <Typography variant="h6">{name}</Typography>
            {collection?.length ? (
              <Timeline
                sx={{
                  m: -2,
                  [`& .${timelineItemClasses.root}::before`]: {
                    flex: 0,
                    p: 0,
                  },
                }}
              >
                {collection.map(({ algo_name, date, value }, i, xs) => (
                  <TimelineItem color="text.secondary" key={i}>
                    <TimelineSeparator>
                      <TimelineDot variant="outlined" />
                      {i !== xs.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <ListItem sx={{ m: -2 }}>
                        <ListItemText
                          secondary={
                            <>
                              {algo_name}
                              {" at "}
                              {formatDate(date)}
                            </>
                          }
                          primary={value}
                        />
                      </ListItem>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              <Typography color="text.secondary">No record claims</Typography>
            )}
          </Stack>
        ))}
      </Grid>
    </Grid>
  );
}
