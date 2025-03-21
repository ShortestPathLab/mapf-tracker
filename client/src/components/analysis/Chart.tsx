import { Box, CircularProgress, useTheme } from "@mui/material";
import { ReactElement, cloneElement } from "react";
import { useCss } from "react-use";
import { ResponsiveContainer, ResponsiveContainerProps } from "recharts";
import { fontFamily } from "theme";

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
    <CircularProgress sx={{ m: "auto" }} />
  ) : (
    <ResponsiveContainer width="100%" {...props}>
      {cloneElement(render, {
        data,
        className: cls,
        style: { fontFamily, fontSize: "0.875rem" },
      })}
    </ResponsiveContainer>
  );
}
