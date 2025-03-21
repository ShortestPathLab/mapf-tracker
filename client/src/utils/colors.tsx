import { colors as muiColors } from "@mui/material";
import convert from "color-convert";
import { sortBy, values } from "lodash";

export const { common, ...accentColors } = muiColors;
export const colors = sortBy(
  values(accentColors),
  (c) => convert.hex.hsl(c[100])[0]
);

export const tone = (
  mode: "light" | "dark" = "light",
  color: (typeof accentColors)[keyof typeof accentColors]
) => {
  return color[mode === "dark" ? "400" : "500"];
};

export const toneBy = (
  mode: "light" | "dark" = "light",
  index: number = 0,
  skip = 2,
  rotate = 7
) => {
  return tone(mode, colors[(index * skip + rotate) % colors.length]);
};
