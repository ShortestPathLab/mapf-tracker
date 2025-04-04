import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import viteTsconfigPaths from "vite-tsconfig-paths";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const ReactCompilerConfig = {
  /* ... */
  target: "18",
};

export default defineConfig({
  // depending on your application, base can also be "/"
  base: "/",
  plugins: [
    viteTsconfigPaths({ loose: true }),
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeKatex],
      }),
    },
    react({
      include: /\.(jsx|js|mdx|md|tsx|ts)$/,
      babel: {
        plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
      },
    }),
  ],
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3000
    port: 3001,
  },
});
