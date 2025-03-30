import { Stack } from "@mui/material";
import { Item } from "components/Item";
import { PreviewCard } from "components/PreviewCard";
import { isUndefined, startCase } from "lodash";
import { PreviewCollection } from "components/PreviewCollection";
import pluralize from "pluralize";
import { useScenario } from "queries/useMapQuery";

export function ScenarioLabel({
  scenarioId,
  count,
}: {
  scenarioId: string;
  count?: number;
}) {
  const { data } = useScenario(scenarioId);
  return (
    <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
      <Stack sx={{ width: 48, pt: 1 }}>
        <PreviewCollection preview={<PreviewCard scenario={scenarioId} />} />
      </Stack>
      <Item
        primary={`${startCase(data?.scen_type ?? "-")}-${data?.type_id ?? "-"}`}
        secondary={
          isUndefined(count) ? undefined : pluralize("item", count, true)
        }
      />
    </Stack>
  );
}
