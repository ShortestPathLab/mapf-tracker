import {
  createTheme,
  alpha,
  SxProps,
  TextFieldProps,
  Theme,
} from "@mui/material";
import { constant, floor, times } from "lodash";

const shadow = `
   rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px
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
      fontFamily,
      allVariants: {
        fontFamily,
        letterSpacing: "0px",
        fontWeight: 450,
      },
      h1: { fontWeight: 550, fontSize: 42 },
      h2: { fontWeight: 550, fontSize: 36 },
      h3: { fontWeight: 500, fontSize: 24 },
      h4: { fontWeight: 500, fontSize: 20 },
      h5: { fontWeight: 500, fontSize: 19 },
      h6: { fontWeight: 500, fontSize: 18 },
      button: { textTransform: "none", fontWeight: 550 },
    },
    components: {
      MuiCard: { defaultProps: { elevation: 0 } },
      MuiAccordion: {
        styleOverrides: { root: { backgroundColor: "transparent" } },
      },
      MuiPaper: {
        styleOverrides: {
          elevation:
            t === "dark"
              ? {
                  backgroundColor: alpha("#4f5053", 0.1),
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
      MuiButtonGroup: {
        defaultProps: { disableElevation: true },
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

export const paper = (elevation: number = 1) => ({
  borderRadius: 1,
  backdropFilter: "blur(16px)",
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
export function usePaper(): (e?: number) => SxProps<Theme> {
  return paper;
}

export const textFieldProps = {
  variant: "filled",
} satisfies TextFieldProps;
