import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export function createWorkspaceViteConfig(base = "/") {
  const resolvedBase = process.env.TILT_BASE ?? base;

  return defineConfig({
    base: resolvedBase,
    plugins: [react()],
    resolve: {
      alias: {
        "@tilt-to-edit/core": fileURLToPath(
          new URL("./packages/core/src/index.ts", import.meta.url),
        ),
        "@tilt-to-edit/react": fileURLToPath(
          new URL("./packages/react/src/index.ts", import.meta.url),
        ),
      },
    },
  });
}
