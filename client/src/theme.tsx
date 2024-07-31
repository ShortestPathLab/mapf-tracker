import {
  createTheme,
  alpha,
  SxProps,
  TextFieldProps,
  Theme,
} from "@mui/material";
import { constant, floor, times } from "lodash";

const shadow = `
    0px 4px 9px -1px rgb(0 0 0 / 4%), 
    0px 5px 24px 0px rgb(0 0 0 / 4%), 
    0px 10px 48px 0px rgb(0 0 0 / 4%)
`;

export const fontFamily =
  '"Inter Tight", "Inter", "Inter Tight", "Helvetica", "Arial", sans-serif';
export const theme = (t: "light" | "dark") =>
  createTheme({
    palette: {
      mode: t,
      background:
        t === "light"
          ? { default: "#f6f6f6", paper: "#ffffff" }
          : { default: "#111317", paper: "#17191d" },
    },
    shape: { borderRadius: 8 },
    shadows: ["", ...times(24, constant(shadow))] as any,
    typography: {
      allVariants: {
        fontFamily,
        letterSpacing: "0px",
        fontWeight: 450,
      },
      h1: { fontWeight: 550, fontSize: 42 },
      h2: { fontWeight: 550, fontSize: 36 },
      h3: { fontWeight: 550, fontSize: 24 },
      h4: { fontWeight: 550, fontSize: 24 },
      h5: { fontWeight: 550, fontSize: 20 },
      h6: { fontWeight: 550, fontSize: 18 },
      button: { textTransform: "none", fontWeight: 550 },
    },
    components: {
      MuiPaper: {
        defaultProps: { elevation: 0 },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { contained: { padding: "16px 32px" } },
      },
    },
  });

export function useAcrylic(color?: string): SxProps<Theme> {
  return {
    backdropFilter: "blur(16px)",
    background: ({ palette }) => alpha(color ?? palette.background.paper, 0.75),
  };
}

export function usePaper(): (e?: number) => SxProps<Theme> {
  return (elevation: number = 1) => ({
    borderRadius: 1,
    transition: ({ transitions }) =>
      transitions.create(["background-color", "box-shadow"]),
    boxShadow: ({ shadows, palette }) =>
      palette.mode === "dark"
        ? shadows[1]
        : shadows[Math.max(floor(elevation) - 1, 0)],
    backgroundColor: ({ palette }) =>
      palette.mode === "dark"
        ? alpha(palette.action.disabledBackground, elevation * 0.02)
        : palette.background.paper,
    border: ({ palette }) =>
      palette.mode === "dark"
        ? `1px solid ${alpha(palette.text.primary, elevation * 0.08)}`
        : `1px solid ${alpha(palette.text.primary, elevation * 0.16)}`,
  });
}

export const textFieldProps = {
  variant: "filled",
} satisfies TextFieldProps;
