import {
  ConversionPathRounded,
  Stat1Rounded,
  StatMinus1Rounded,
} from "@mui-symbols-material/w400";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  timelineItemClasses,
} from "@mui/lab";
import {
  Divider,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { isDefined } from "@mui/x-charts/internals";
import { ActionBar } from "components/ActionBar";
import { DetailsList } from "components/DetailsList";
import { Dot } from "components/Dot";
import { useSnackbarAction } from "components/Snackbar";
import Grid from "layout/Grid";
import { capitalize, head } from "lodash";
import pluralize from "pluralize";
import { useAlgorithmForInstanceData } from "queries/useAlgorithmQuery";
import { useMapData, useScenarioDetailsData } from "queries/useBenchmarksQuery";
import { useInstanceData } from "queries/useInstanceQuery";
import { formatDate } from "utils/format";
import { downloadRow } from "./download";

export default function Details({ id }: { id?: string }) {
  const notify = useSnackbarAction();
  const { data: history } = useAlgorithmForInstanceData(id);
  const { data: instance } = useInstanceData(id);
  const { data: scenario } = useScenarioDetailsData(instance?.scen_id);
  const { data: map } = useMapData(instance?.map_id);
  const isClosed =
    instance?.solution_cost && instance.solution_cost === instance.lower_cost;
  return (
    <Stack sx={{ gap: 4 }}>
      <DetailsList
        sx={{ m: -2 }}
        items={[
          {
            label: "Instance",
            value: instance && pluralize("agent", instance.agents, true),
          },
          {
            label: "Scenario",
            value: scenario && `${scenario.scen_type}-${scenario.type_id}`,
          },
          { label: "Map", value: map?.map_name },
          {
            label: "Status",
            value: instance && (
              <>
                <Dot
                  sx={{
                    bgcolor: instance.solution_cost
                      ? isClosed
                        ? "info.main"
                        : "success.main"
                      : "warning.main",
                  }}
                />
                {capitalize(
                  [
                    instance.solution_cost ? "solved" : "unsolved",
                    isClosed ? "closed" : "open",
                  ].join(", ")
                )}
              </>
            ),
          },
        ]}
      />
      <ActionBar
        options={[
          {
            label: "Solution paths (.csv)",
            primary: true,
            icon: <ConversionPathRounded />,
            action: notify(() => downloadRow(instance), {
              end: "File downloaded",
            }),
          },
        ]}
      />
      <Divider />
      <Grid sx={{ gap: 4 }}>
        {[
          {
            name: "Lower-bound record claims",
            collection: head(history)?.lower_algos,
            best: "max",
          },
          {
            name: "Solution record claims",
            collection: head(history)?.solution_algos,
            best: "min",
          },
        ].map(({ name, collection, best }) => (
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
                {collection.map(({ algo_name, date, value }, i, xs) => {
                  const previous = i === 0 ? undefined : xs[i - 1]?.value;
                  return (
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
                            primary={
                              <>
                                {value ?? "0"}
                                {isDefined(previous) && previous !== value ? (
                                  previous < value ? (
                                    <Stat1Rounded
                                      sx={{
                                        ml: 0.5,
                                        transform: "translateY(4px)",
                                      }}
                                      fontSize="small"
                                      color={
                                        best === "max" ? "success" : "error"
                                      }
                                    />
                                  ) : (
                                    <StatMinus1Rounded
                                      sx={{
                                        ml: 0.5,
                                        transform: "translateY(4px)",
                                      }}
                                      fontSize="small"
                                      color={
                                        best === "max" ? "error" : "success"
                                      }
                                    />
                                  )
                                ) : (
                                  ""
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      </TimelineContent>
                    </TimelineItem>
                  );
                })}
              </Timeline>
            ) : (
              <Typography color="text.secondary">No record claims</Typography>
            )}
          </Stack>
        ))}
      </Grid>
    </Stack>
  );
}
