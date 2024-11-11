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
      rollupTypes: true,
    }),
  ],
  build: {
    target: "esnext",
    outDir: "lib",
    lib: { entry: "src/index.ts", name: "parser", fileName: "index" },
  },
});
