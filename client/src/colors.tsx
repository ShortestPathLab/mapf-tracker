import { colors as muiColors } from "@mui/material";
import { values } from "lodash";

export const { common, ...accentColors } = muiColors;
export const colors = values(accentColors);

export const tone = (
  mode: "light" | "dark" = "light",
  color: (typeof accentColors)[keyof typeof accentColors]
) => {
  return color[mode === "dark" ? "400" : "700"];
};

export const toneBy = (mode: "light" | "dark" = "light", index: number = 0) => {
  return tone(mode, colors[(index * 2) % colors.length]);
};
