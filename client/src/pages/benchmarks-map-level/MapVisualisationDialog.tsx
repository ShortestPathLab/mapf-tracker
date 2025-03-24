import { FullsizeDialog } from "pages/submission-summary/table/DetailsDialog";
import { MapVisualisation } from "pages/visualiser/SolutionVisualisation";

export function MapVisualisationDialog({
  mapId,
  scenarioId,
}: {
  mapId?: string;
  scenarioId?: string;
}) {
  return (
    <FullsizeDialog>
      <MapVisualisation mapId={mapId} scenarioId={scenarioId} />
    </FullsizeDialog>
  );
}
