import { Stack, Box } from "@mui/material";

export const makePreviewImagePageRenderFunction =
  (url: string) =>
  ({ header, children }) =>
    (
      <>
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
          {header}
          <Box component="img" sx={{ height: 83, borderRadius: 1 }} src={url} />
        </Stack>
        {children}
      </>
    );
