import { Analysis } from "components/analysis/Analysis";
import { useLocationState } from "hooks/useNavigation";
import { DataInspectorLayout } from "layout/DataInspectorLayout";
import Layout from "layout/Layout";
import { makePreviewImagePageRenderFunction } from "layout/render";
import { capitalize } from "lodash";
import { ScenarioLevelLocationState } from "./ScenarioLevelLocationState";
import Table from "./Table";
import { analysisTemplate } from "./analysisTemplate";

export default function Page() {
  const state = useLocationState<ScenarioLevelLocationState>();
  const { mapName, scenType, scenTypeID, mapId, scenId } = state;
  const title = `${scenType}-${scenTypeID}`;
  return (
    <Layout
      flat
      title={capitalize(title)}
      description={`View all benchmarks and their results for ${title}`}
      path={[
        { name: "Home", url: "/" },
        { name: "Benchmarks", url: "/benchmarks" },
        {
          name: capitalize(mapName),
          url: "/scenarios",
          state,
        },
      ]}
      render={makePreviewImagePageRenderFunction(`/mapf-svg/${mapName}.svg`)}
    >
      <DataInspectorLayout
        analysisTabName={`Analyse ${scenType}-${scenTypeID}`}
        data={<Table />}
        analysis={
          <Analysis
            template={analysisTemplate(
              scenType,
              scenTypeID,
              mapName,
              scenId,
              mapId
            )}
          />
        }
      />
    </Layout>
  );
}
