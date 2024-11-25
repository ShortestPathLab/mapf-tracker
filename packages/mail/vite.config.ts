/// <reference types="vitest" />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    outDir: "lib",
    ssr: true,
    lib: { entry: "src/index.ts", name: "mail", fileName: "index" },
  },
});
