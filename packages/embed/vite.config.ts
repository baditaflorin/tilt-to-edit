import { resolve } from "node:path";

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "TiltToEdit",
      formats: ["es", "iife"],
      fileName: (format) =>
        format === "iife" ? "tilt-to-edit-embed.iife.js" : "tilt-to-edit-embed.js",
    },
    rollupOptions: {
      output: {
        exports: "named",
      },
    },
  },
});
