import { Layout } from "layout";
import Visualiser from "./Visualiser";
import { useLocationState } from "hooks/useNavigation";
import { capitalize } from "lodash";
import { VisualiserLocationState } from "./VisualiserLocationState";
import { Box } from "@mui/material";
import { useMd, useSm } from "components/dialog/useSmallDisplay";
import { navbarHeight } from "components/Navbar";

export { default as Visualiser } from "./Visualiser";

export default function index() {
  const sm = useSm();
  const md = useMd();
  const state = useLocationState<VisualiserLocationState>();
  const scenarioString = capitalize(`${state.scenType}-${state.scenTypeID}`);

  return (
    <Layout
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
      render={({ header, children }) => (
        <>
          {children}
          {
            <Box
              sx={{
                width: "max-content",
                zIndex: 1,
                position: "fixed",
                top: (t) => t.spacing(sm ? 2 : 3),
                left: (t) => t.spacing(sm ? 2 : 3),
              }}
            >
              {header}
            </Box>
          }
        </>
      )}
    >
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: `calc(100dvh - ${navbarHeight(md) - 6}px)`,
          width: "100%",
        }}
      >
        <Visualiser />
      </Box>
    </Layout>
  );
}
