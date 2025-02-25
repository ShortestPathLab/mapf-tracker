import { Box } from "@mui/material";
import { useSm } from "components/dialog/useSmallDisplay";

export const RenderFixed = ({ header, children }) => {
  const sm = useSm();
  return (
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
};
