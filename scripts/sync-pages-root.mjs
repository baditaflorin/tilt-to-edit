import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const sourceRoot = resolve("pages-dist");
const targets = ["basic", "demo", "list", "menu", "space", "stepper"];

for (const target of targets) {
  await rm(resolve(target), { recursive: true, force: true });
  await mkdir(resolve(target), { recursive: true });
  await cp(resolve(sourceRoot, target), resolve(target), { recursive: true });
}

await cp(resolve(sourceRoot, "index.html"), resolve("index.html"), {
  force: true,
});
await cp(resolve(sourceRoot, ".nojekyll"), resolve(".nojekyll"), {
  force: true,
});
