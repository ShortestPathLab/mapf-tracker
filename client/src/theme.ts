import {
  Shadows,
  SxProps,
  TextFieldProps,
  Theme,
  alpha,
  createTheme,
} from "@mui/material";
import { constant, times } from "lodash";
import { accentColors } from "utils/colors";

const shadow = `
rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px
`;

export const fontFamily = '"Geist", "Inter", "Helvetica", "Arial", sans-serif';

export const theme = (t: "light" | "dark") =>
  createTheme({
    palette: {
      text: {
        primary: t === "light" ? "#000000" : "#f4f4f5",
        secondary: t === "light" ? "#71717a" : "#a1a1aa",
      },
      primary: {
        main: t === "light" ? "#18181b" : "#f4f4f5",
        contrastText: t === "light" ? "#ffffff" : "#09090b",
      },
      secondary: {
        main: t === "light" ? accentColors.indigo.A700 : "#a8c7fa",
        contrastText: t === "light" ? "#ffffff" : "#062e6f",
      },
      divider: alpha(t === "light" ? "#000000" : "#f4f4f5", 0.12),
      mode: t,
      background:
        t === "light"
          ? { default: "#fafafa", paper: "#ffffff" }
          : { default: "#18181b", paper: "#111113" },
    },
    shape: { borderRadius: 8 },
    transitions: {
      easing: {
        easeInOut: "cubic-bezier(0.2, 0, 0, 1)",
        easeOut: "cubic-bezier(0.05, 0.7, 0.1, 1.0)",
        easeIn: "cubic-bezier(0.3, 0.0, 0.8, 0.15)",
      },
    },
    shadows: ["", ...times(24, constant(shadow))] as unknown as Shadows,
    typography: {
      fontFamily,
      allVariants: {
        fontFamily,
        letterSpacing: "-.025em",
        fontWeight: 450,
      },
      overline: { fontWeight: 450, textTransform: "none", fontSize: 14 },
      h1: { fontWeight: 550, fontSize: 42 },
      h2: { fontWeight: 550, fontSize: 36 },
      h3: { fontWeight: 550, fontSize: 24 },
      h4: { fontWeight: 500, fontSize: 20 },
      h5: { fontWeight: 500, fontSize: 19 },
      h6: { fontWeight: 550, fontSize: 18 },
      body2: { letterSpacing: "0" },
      button: { textTransform: "none", fontWeight: 550 },
    },
    components: {
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundColor: t === "light" ? "#ffffff" : "#111113",
          },
        },
      },
      MuiAccordion: {
        styleOverrides: { root: { backgroundColor: "transparent" } },
      },
      MuiPaper: {
        styleOverrides: {
          elevation:
            t === "dark"
              ? {
                  backgroundColor: alpha("#111317", 1),
                }
              : undefined,
          elevation1: { backdropFilter: "blur(16px)" },
          elevation2: { backdropFilter: "blur(16px)" },
          elevation3: { backdropFilter: "blur(16px)" },
          elevation4: { backdropFilter: "blur(16px)" },
          elevation5: { backdropFilter: "blur(16px)" },
          elevation6: { backdropFilter: "blur(16px)" },
          elevation7: { backdropFilter: "blur(16px)" },
          elevation8: { backdropFilter: "blur(16px)" },
        },
      },
      MuiButton: {
        styleOverrides: {
          contained: {
            padding: "16px 32px",
          },
          outlined: {
            padding: "16px 32px",
            borderColor: alpha(t === "light" ? "#000000" : "#f4f4f5", 0.12),
          },
        },
      },
    },
  });

export function useAcrylic(color?: string): SxProps<Theme> {
  return {
    backdropFilter: "blur(16px)",
    background: ({ palette }) => alpha(color ?? palette.background.paper, 0.75),
  };
}

const solid = (b: string) => `linear-gradient(to bottom, ${b}, ${b})`;

export const paper = (elevation: number = 1) =>
  ({
    boxSizing: "border-box",
    borderRadius: 1,
    backdropFilter: "blur(16px)",
    transition: ({ transitions }) =>
      transitions.create(["background-color", "box-shadow"]),
    boxShadow: ({ shadows }) => shadows[elevation],
    backgroundImage: ({ palette }) =>
      `${solid(
        palette.mode === "dark"
          ? alpha(palette.action.disabledBackground, elevation * 0.01)
          : palette.background.paper
      )}, ${solid(
        palette.mode === "dark"
          ? alpha(palette.background.default, 0.25)
          : palette.background.paper
      )}`,
    border: ({ palette }) =>
      palette.mode === "dark"
        ? `1px solid ${alpha(palette.text.primary, 0.06 + elevation * 0.04)}`
        : `1px solid ${alpha(palette.text.primary, 0.08 + elevation * 0.01)}`,
  } satisfies SxProps<Theme>);
export function usePaper(): (e?: number) => SxProps<Theme> {
  return paper;
}

export const textFieldProps = {
  variant: "filled",
} satisfies TextFieldProps;
