import { Card } from "@mui/material";
import Layout, { DataInspectorLayout } from "layout/Layout";
import { makePreviewImagePageRenderFunction } from "layout/render";
import { capitalize } from "lodash";
import { useLocationState } from "hooks/useNavigation";
import Table from "./Table";
import { MapLevelLocationState } from "./MapLevelLocationState";
import { Analysis } from "components/analysis/Analysis";
import { analysisTemplate } from "./analysisTemplate";

export default function Page() {
  const { mapName, mapId } = useLocationState<MapLevelLocationState>();
  return (
    <Layout
      title={capitalize(mapName)}
      path={[
        { name: "MAPF Tracker", url: "/" },
        { name: "Benchmarks", url: "/benchmarks" },
      ]}
      render={makePreviewImagePageRenderFunction(`/mapf-svg/${mapName}.svg`)}
    >
      <DataInspectorLayout
        analysisTabName={`Analyse ${mapName}`}
        data={
          <Card>
            <Table />
          </Card>
        }
        analysis={
          <Card>
            <Analysis template={analysisTemplate(mapName, mapId)} />
          </Card>
        }
      />
    </Layout>
  );
}
