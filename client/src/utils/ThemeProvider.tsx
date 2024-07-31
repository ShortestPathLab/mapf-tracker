import { createContext } from "react";

export const ThemeContext = createContext<["light" | "dark", () => void]>([
  localStorage.getItem("theme") || "dark",
  () => {},
] as any);
