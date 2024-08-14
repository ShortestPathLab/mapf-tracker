import { createContext, useContext } from "react";

export const ThemeContext = createContext<["light" | "dark", () => void]>([
  localStorage.getItem("theme") || "dark",
  () => {},
] as any);

export function useMode() {
  return useContext(ThemeContext);
}
