import { Card } from "@mui/material";
import Layout, { DataInspectorLayout } from "layout/Layout";
import { makePreviewImagePageRenderFunction } from "layout/render";
import { capitalize } from "lodash";
import { useLocationState } from "hooks/useNavigation";
import Table from "./Table";
import { ScenarioLevelLocationState } from "./ScenarioLevelLocationState";
import { Analysis } from "components/analysis/Analysis";
import { analysisTemplate } from "./analysisTemplate";

export default function Page() {
  const state = useLocationState<ScenarioLevelLocationState>();
  const { mapName, scenType, scenTypeID, mapId, scenId } = state;
  return (
    <Layout
      title={capitalize(`${scenType}-${scenTypeID}`)}
      path={[
        { name: "MAPF Tracker", url: "/" },
        { name: "Benchmarks", url: "/benchmarks" },
        ,
        {
          name: capitalize(mapName),
          url: "/scenarios",
          state: state,
        },
      ]}
      render={makePreviewImagePageRenderFunction(`/mapf-svg/${mapName}.svg`)}
    >
      <DataInspectorLayout
        analysisTabName={`Analyse ${scenType}-${scenTypeID}`}
        data={
          <Card>
            <Table />
          </Card>
        }
        analysis={
          <Card>
            <Analysis
              template={analysisTemplate(
                scenType,
                scenTypeID,
                mapName,
                scenId,
                mapId
              )}
            />
          </Card>
        }
      />
    </Layout>
  );
}
