import { colors as muiColors } from "@mui/material";
import convert from "color-convert";
import { sortBy, values } from "lodash";

export const { common, ...accentColors } = muiColors;
export const colors = sortBy(values(accentColors), (c) => convert.hex.hsl(c[100])[0]);

export const tone = (
  mode: "light" | "dark" = "light",
  color: (typeof accentColors)[keyof typeof accentColors],
) => {
  return color[mode === "dark" ? "400" : "500"];
};

// Remove greys from palette
const tones = [
  accentColors["amber"],
  accentColors["blue"],
  accentColors["brown"],
  accentColors["cyan"],
  accentColors["deepOrange"],
  accentColors["deepPurple"],
  accentColors["green"],
  accentColors["indigo"],
  accentColors["lightBlue"],
  accentColors["lightGreen"],
  accentColors["lime"],
  accentColors["orange"],
  accentColors["pink"],
  accentColors["purple"],
  accentColors["red"],
  accentColors["teal"],
  accentColors["yellow"],
];

export const toneBy = (
  mode: "light" | "dark" = "light",
  index: number = 0,
  skip = 1,
  rotate = 7,
) => {
  return tone(mode, tones[(index * skip + rotate) % tones.length]);
};
