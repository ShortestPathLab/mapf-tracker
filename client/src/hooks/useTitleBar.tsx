import { getContrastRatio } from "@mui/material";
import { defer } from "lodash";
import { useEffect } from "react";

const getForegroundColor = (bg: string) =>
  getContrastRatio(bg, "#ffffff") > getContrastRatio(bg, "#000000")
    ? "#ffffff"
    : "#000000";

export function useTitleBar(color: string) {
  useEffect(() => {
    defer(() => {
      document
        .querySelector('meta[name="theme-color"]')!
        .setAttribute("content", color);
      document.documentElement.style.backgroundColor = color;
      document.body.style.backgroundColor = color;
    });
  }, [color]);
}
