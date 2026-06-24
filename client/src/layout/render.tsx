import { Stack, Box } from "@mui/material";
import { LayoutRenderProps } from "./Layout";

export const makePreviewImagePageRenderFunction =
  (url: string) =>
  ({ header, children }: LayoutRenderProps) =>
    (
      <>
        <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2 }}>
          {header}
          <Box component="img" sx={{ height: 83, borderRadius: 1 }} src={url} />
        </Stack>
        {children}
      </>
    );
