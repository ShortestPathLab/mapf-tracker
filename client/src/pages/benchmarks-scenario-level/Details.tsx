import { ConversionPathRounded } from "@mui-symbols-material/w400";
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
import { DetailsList } from "components/DetailsList";
import { Dot } from "components/Dot";
import { DownloadBar } from "components/DownloadBar";
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
                      ? "success.main"
                      : "warning.main",
                  }}
                />
                {capitalize(
                  [
                    instance.solution_cost ? "solved" : "unsolved",
                    instance.solution_cost &&
                    instance.solution_cost === instance.lower_cost
                      ? "closed"
                      : "open",
                  ].join(", ")
                )}
              </>
            ),
          },
        ]}
      />
      <DownloadBar
        options={[
          {
            label: "Download solution (.csv)",
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
    </Stack>
  );
}
