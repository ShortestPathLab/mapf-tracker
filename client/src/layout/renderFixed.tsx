import { Box } from "@mui/material";

export function renderFixed(sm: boolean) {
  return ({ header, children }) => (
    <>
      {children}
      {
        <Box
          sx={{
            width: "max-content",
            zIndex: 1,
            position: "fixed",
            top: (t) => t.spacing(sm ? 2 : 3),
            left: (t) => t.spacing(sm ? 2 : 3),
          }}
        >
          {header}
        </Box>
      }
    </>
  );
}
