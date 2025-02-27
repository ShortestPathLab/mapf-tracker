import { Box, Button, Stack, Typography } from "@mui/material";
import { PreviewCard } from "components/PreviewCard";
import { Dialog } from "components/dialog";
import { useSm } from "components/dialog/useSmallDisplay";
import { useLocationState } from "hooks/useNavigation";
import { BentoLayout } from "layout/BentoLayout";
import { topbarHeight } from "layout/topbarHeight";
import { startCase } from "lodash";
import Details from "pages/benchmarks-scenario-level/Details";
import pluralize from "pluralize";
import { useInstanceData } from "queries/useInstanceQuery";
import Visualiser from "./Visualiser";
import { VisualiserLocationState } from "./VisualiserLocationState";

export { default as Visualiser } from "./Visualiser";

export default function index() {
  const sm = useSm();
  const state = useLocationState<VisualiserLocationState>();
  const scenarioString = startCase(`${state.scenType}-${state.scenTypeID}`);
  const { data: instanceData } = useInstanceData(state.instanceId);
  const title = pluralize("agent", instanceData?.agents ?? 0, true);
  return (
    <BentoLayout
      title={title}
      path={[
        { name: "Home", url: "/" },
        { name: "Benchmarks", url: "/benchmarks" },
        {
          name: startCase(state.mapName),
          url: "/scenarios",
          state,
        },
        {
          name: scenarioString,
          url: "/instances",
          state,
        },
      ]}
      labelLeft="Instance details"
      contentLeft={
        <Stack sx={{ gap: 4 }}>
          <Details id={state.instanceId} />
          <Stack sx={{ gap: 2 }}>
            <Typography variant="h6">Problem configuration</Typography>
            <PreviewCard
              instance={state.instanceId}
              sx={{
                width: "100%",
                maxWidth: 480,
                aspectRatio: 1,
                height: "auto",
              }}
            />
          </Stack>
        </Stack>
      }
      labelRight="Best solution"
      contentRight={
        sm ? (
          <Dialog
            slotProps={{ modal: { variant: "default", fullScreen: true } }}
            trigger={(onClick) => (
              <Button {...{ onClick }} variant="contained">
                Open visualiser
              </Button>
            )}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: `calc(100dvh - ${8}px)`,
              }}
            >
              <Visualiser />
            </Box>
          </Dialog>
        ) : (
          <>
            <Box
              sx={{
                bgcolor: "background.paper",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: `calc(100dvh - ${topbarHeight(sm) + 8}px)`,
              }}
            >
              <Visualiser />
            </Box>
            <Typography
              variant="h2"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                p: 3,
              }}
            >
              Best solution
            </Typography>
          </>
        )
      }
    />
  );
}
