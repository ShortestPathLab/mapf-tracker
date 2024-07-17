/// <reference types="vitest" />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({
      insertTypesEntry: true,
      include: "src/**/*",
    }),
  ],
  build: {
    outDir: "lib",
    ssr: true,
    lib: { entry: "src/index.ts", name: "validator", fileName: "index" },
  },
});
