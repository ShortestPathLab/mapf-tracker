import {
  Box,
  CircularProgress,
  Fade,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { ReactElement, cloneElement } from "react";
import { useCss, useTimeout } from "react-use";
import { ResponsiveContainer, ResponsiveContainerProps } from "recharts";
import { fontFamily } from "theme";

export function Loading() {
  "use no memo";
  const [ready] = useTimeout(4500);
  return (
    <Stack
      sx={{
        gap: 4,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <CircularProgress />
      {ready() && (
        <Typography color="text.secondary" variant="body2">
          Generating data for the first time (this may take a while)
        </Typography>
      )}
    </Stack>
  );
}

export function Chart<T>({
  data,
  render = <Box />,
  isLoading,
  ...props
}: {
  data: T;
  render: ReactElement;
  isLoading?: boolean;
} & Partial<ResponsiveContainerProps>) {
  const { palette, shape, shadows } = useTheme();
  const cls = useCss({
    "& .recharts-default-tooltip": {
      backgroundImage: `linear-gradient(to bottom, ${palette.background.default}, ${palette.background.default})`,
      borderRadius: `${shape.borderRadius}px`,
      boxShadow: shadows[1],
    },
  });
  return isLoading ? (
    <Loading />
  ) : (
    <Fade in>
      <Box sx={{ flex: 1, width: "100%", height: "100%" }}>
        <ResponsiveContainer
          width="100%"
          {...props}
          style={{ overflow: "hidden", ...props.style }}
        >
          {cloneElement(render, {
            data,
            className: cls,
            style: { fontFamily, fontSize: "0.875rem" },
          })}
        </ResponsiveContainer>
      </Box>
    </Fade>
  );
}
