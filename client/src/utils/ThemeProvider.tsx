import { createContext, useContext } from "react";

export const ThemeContext = createContext<["light" | "dark", () => void]>([
  localStorage.getItem("theme") || "dark",
  () => {},
] as ["light" | "dark", () => void]);

export function useMode() {
  return useContext(ThemeContext);
}
