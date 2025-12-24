import { paper } from "../theme";
import { Grid } from "layout";
import { Stack } from "@mui/material";
import type { ReactNode } from "react";

export function ItemGrid({
  items,
  ...props
}: { items: ReactNode[] } & ComponentProps<typeof Grid>) {
  return (
    <Grid sx={{ gap: 2 }} {...props}>
      {items?.map?.((item) => {
        return (
          <Stack
            direction="row"
            sx={{
              ...paper(),
              alignItems: "center",
              gap: 2,
              justifyContent: "space-between",
              px: 2,
              py: 1,
            }}
          >
            {item}
          </Stack>
        );
      })}
    </Grid>
  );
}
