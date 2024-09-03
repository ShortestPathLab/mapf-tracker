import { Box } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";
import { useLocationState } from "hooks/useNavigation";
import { Layout } from "layout";
import { topbarHeight } from "layout/topbarHeight";
import { renderFixed } from "layout/renderFixed";
import { capitalize } from "lodash";
import Visualiser from "./Visualiser";
import { VisualiserLocationState } from "./VisualiserLocationState";

export { default as Visualiser } from "./Visualiser";

export default function index() {
  const sm = useSm();
  const state = useLocationState<VisualiserLocationState>();
  const scenarioString = capitalize(`${state.scenType}-${state.scenTypeID}`);

  return (
    <Layout
      collapse={false}
      width="none"
      title="Visualise"
      path={[
        { name: "Home", url: "/" },
        { name: "Benchmarks", url: "/benchmarks" },
        {
          name: capitalize(state.map_name),
          url: "/scenarios",
          state,
        },
        {
          name: scenarioString,
          url: "/instances",
          state,
        },
      ]}
      render={renderFixed(sm)}
    >
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: `calc(100dvh - ${topbarHeight(sm) - 6}px)`,
          width: "100%",
        }}
      >
        <Visualiser />
      </Box>
    </Layout>
  );
}
