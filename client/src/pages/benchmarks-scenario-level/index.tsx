import { PreviewCard } from "components/PreviewCard";
import { Analysis } from "components/analysis/Analysis";
import { useLocationState } from "hooks/useNavigation";
import { DataInspectorLayout } from "layout/DataInspectorLayout";
import { GalleryLayout } from "layout/GalleryLayout";
import { startCase } from "lodash";
import { useScenarioData } from "queries/useBenchmarksQuery";
import { ScenarioLevelLocationState } from "./ScenarioLevelLocationState";
import Table from "./Table";
import { analysisTemplate } from "./analysisTemplate";

export default function Page() {
  const state = useLocationState<ScenarioLevelLocationState>();
  const { mapName, scenType, scenTypeID, mapId, scenId } = state;
  const title = `${scenType}-${scenTypeID}`;
  const { data: scenarioData } = useScenarioData(scenId);
  return (
    <GalleryLayout
      title={startCase(title)}
      description={`Problem instances for ${title} on ${mapName}`}
      path={[
        { name: "Home", url: "/" },
        { name: "Benchmarks", url: "/benchmarks" },
        {
          name: startCase(mapName),
          url: "/scenarios",
          state,
        },
      ]}
      cover={
        <PreviewCard
          scenario={scenarioData?.id}
          sx={{ width: "100%", height: "auto", aspectRatio: 1 }}
        />
      }
      items={[
        {
          value: <code>{scenarioData?.scen_type}</code>,
          label: "Type",
        },
        { value: <code>{scenarioData?.type_id}</code>, label: "Type ID" },
        { value: <code>{mapName}</code>, label: "Map ID" },
        {
          value: scenarioData?.instances,
          label: "Instance count",
        },
      ]}
    >
      <DataInspectorLayout
        analysisTabName={`Analyse this scenario`}
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
    </GalleryLayout>
  );
}
