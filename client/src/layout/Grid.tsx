import { Stack, StackProps } from "@mui/material";

type Props = {
  width?: number;
} & StackProps;

export default function Grid({ width = 280, children, ...props }: Props) {
  return (
    <Stack
      {...props}
      sx={{
        display: "grid",
        gridAutoFlow: "row dense",
        gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${width}px), 1fr))`,
        ...props.sx,
      }}
    >
      {children}
    </Stack>
  );
}
