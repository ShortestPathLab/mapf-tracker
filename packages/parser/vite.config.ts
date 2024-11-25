/// <reference types="vitest" />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths() as any],
  build: {
    target: "esnext",
    outDir: "lib",
    lib: { entry: "src/index.ts", name: "parser", fileName: "index" },
  },
});
