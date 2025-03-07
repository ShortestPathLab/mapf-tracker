import { createContext, useContext } from "react";
import { usePersistentReducer } from "hooks/usePersistentReducer";
import { identifier } from "core/config";

const key = `${identifier}.theme`;

export const storedTheme = (localStorage.getItem(key) || "dark") as
  | "light"
  | "dark";

export const ThemeContext = createContext<["light" | "dark", () => void]>([
  storedTheme,
  () => {},
] as ["light" | "dark", () => void]);

export function useMode() {
  return useContext(ThemeContext);
}
export function useThemeState() {
  return usePersistentReducer<typeof key, void, "light" | "dark">(
    key,
    (prev: "light" | "dark") => (prev === "light" ? "dark" : "light"),
    storedTheme
  );
}
