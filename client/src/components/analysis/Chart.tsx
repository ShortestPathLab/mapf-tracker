import { Box, CircularProgress, useTheme } from "@mui/material";
import { ReactElement, cloneElement } from "react";
import { useCss } from "react-use";
import { ResponsiveContainer, ResponsiveContainerProps } from "recharts";
import { fontFamily } from "theme";

export function Chart<T>({
  data,
  render = () => <Box />,
  isLoading,
  ...props
}: {
  data: T;
  render: (data: T) => ReactElement;
  isLoading?: boolean;
} & Partial<ResponsiveContainerProps>) {
  const { palette, shape } = useTheme();
  const cls = useCss({
    "& .recharts-default-tooltip": {
      backgroundImage: `linear-gradient(to bottom, ${palette.background.paper}, ${palette.background.paper})`,
      borderRadius: `${shape.borderRadius}px`,
    },
  });
  return isLoading ? (
    <CircularProgress sx={{ m: "auto" }} />
  ) : (
    <ResponsiveContainer width="100%" {...props}>
      {cloneElement(render(data), {
        data,
        className: cls,
        style: { fontFamily, fontSize: "0.875rem" },
      })}
    </ResponsiveContainer>
  );
}
