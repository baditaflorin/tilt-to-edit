import { cp } from "node:fs/promises";
import { resolve } from "node:path";

await cp(resolve("index.html"), resolve("dist/index.html"));
await cp(resolve("src/styles.css"), resolve("dist/styles.css"));
await cp(
  resolve("../../packages/embed/dist/tilt-to-edit-embed.iife.js"),
  resolve("dist/tilt-to-edit-embed.iife.js"),
);
