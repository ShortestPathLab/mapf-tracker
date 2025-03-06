import { Stack } from "@mui/material";
import { Item } from "components/Item";
import { PreviewCard } from "components/PreviewCard";
import Enter from "components/transitions/Enter";
import pluralize from "pluralize";
import { useInstanceData } from "queries/useInstanceQuery";

export function InstanceLabel({ id }: { id?: string }) {
  const { data: instance, isLoading } = useInstanceData(id);
  return (
    <Enter axis="x" in={!isLoading}>
      <Stack
        direction="row"
        sx={{
          gap: 2,
          width: 320,
          alignItems: "center",
        }}
      >
        <PreviewCard instance={id} />
        <Item primary={pluralize("agent", instance?.agents ?? 0, true)} />
      </Stack>
    </Enter>
  );
}
