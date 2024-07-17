import { colors as muiColors } from "@mui/material";
import { values } from "lodash";

export const { common, ...accentColors } = muiColors;
export const colors = values(accentColors);
