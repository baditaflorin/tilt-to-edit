import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import QRCode from "qrcode";

const [repoOwner, repoName] = (
  process.env.GITHUB_REPOSITORY ?? "baditaflorin/tilt-to-edit"
).split("/");
const basePrefix = `/${repoName}`;
const siteRoot = `https://${repoOwner}.github.io/${repoName}`;
const outputDir = resolve("pages-dist");
const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm";

const demos = [
  {
    slug: "demo",
    title: "Integrated Demo",
    description:
      "One live-device shell that combines telemetry, stepper, slider, list navigation, and hybrid menu selection.",
    workspace: "@tilt-to-edit/demo",
    distDir: resolve("apps/demo/dist"),
    kind: "Primary demo",
    publicUrl: `${siteRoot}/demo/`,
  },
  {
    slug: "basic",
    title: "React Basic",
    description:
      "Permission flow, calibration, normalized intent output, and explicit confirmation state.",
    workspace: "@tilt-to-edit/react-basic-example",
    distDir: resolve("examples/react-basic/dist"),
    kind: "Hook example",
    publicUrl: `${siteRoot}/basic/`,
  },
  {
    slug: "stepper",
    title: "React Stepper",
    description:
      "Discrete left-right tilt editing with smaller step thresholds and explicit confirmation.",
    workspace: "@tilt-to-edit/react-stepper-example",
    distDir: resolve("examples/react-stepper/dist"),
    kind: "Discrete control",
    publicUrl: `${siteRoot}/stepper/`,
  },
  {
    slug: "list",
    title: "React List Navigator",
    description:
      "Vertical tilt zones for list navigation with separate commit behavior.",
    workspace: "@tilt-to-edit/react-list-navigator-example",
    distDir: resolve("examples/react-list-navigator/dist"),
    kind: "Navigation example",
    publicUrl: `${siteRoot}/list/`,
  },
  {
    slug: "menu",
    title: "React Menu Selector",
    description:
      "Browse vertically, tilt right to commit, and tilt left to return to the current selection.",
    workspace: "@tilt-to-edit/react-menu-selector-example",
    distDir: resolve("examples/react-menu-selector/dist"),
    kind: "Hybrid control",
    publicUrl: `${siteRoot}/menu/`,
  },
  {
    slug: "space",
    title: "React Vector Space",
    description:
      "A 3D menu stack that lets you browse vertically and commit or return with left-right tilt, wrapped in glowing motion vectors.",
    workspace: "@tilt-to-edit/react-vector-space-example",
    distDir: resolve("examples/react-vector-space/dist"),
    kind: "3D menu",
    publicUrl: `${siteRoot}/space/`,
  },
];

function run(command, args, env = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: {
        ...process.env,
        ...env,
      },
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      rejectPromise(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
    });

    child.on("error", rejectPromise);
  });
}

async function createLandingPage() {
  const cards = await Promise.all(
    demos.map(async (demo) => {
      const qrSvg = await QRCode.toString(demo.publicUrl, {
        type: "svg",
        width: 132,
        margin: 1,
        errorCorrectionLevel: "M",
        color: {
          dark: "#10233d",
          light: "#ffffff",
        },
      });

      return `
        <a class="card" href="./${demo.slug}/">
          <div class="card-copy">
            <p class="kind">${demo.kind}</p>
            <h2>${demo.title}</h2>
            <p>${demo.description}</p>
            <p class="url">${demo.publicUrl}</p>
            <span>Open demo</span>
          </div>
          <div class="qr-block">
            <div class="qr-image" aria-hidden="true">
              ${qrSvg}
            </div>
            <p class="qr-label">Scan on phone</p>
          </div>
        </a>`;
    }),
  );

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tilt To Edit Demos</title>
    <style>
      :root {
        color-scheme: dark;
        --ink: #f8fafc;
        --muted: rgba(226, 232, 240, 0.72);
        --panel: linear-gradient(150deg, rgba(9, 22, 41, 0.84), rgba(31, 18, 48, 0.68));
        --accent: #fbbf24;
        --line: rgba(255, 255, 255, 0.08);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Avenir Next", "Trebuchet MS", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(251, 191, 36, 0.16), transparent 28%),
          radial-gradient(circle at right 20%, rgba(56, 189, 248, 0.16), transparent 24%),
          radial-gradient(circle at 50% 100%, rgba(236, 72, 153, 0.14), transparent 30%),
          linear-gradient(180deg, #07111f 0%, #0f1d33 44%, #190f2f 100%);
      }

      main {
        max-width: 1160px;
        margin: 0 auto;
        padding: 3rem 1.25rem 4rem;
      }

      .hero {
        display: grid;
        gap: 1rem;
        margin-bottom: 2.2rem;
      }

      .eyebrow {
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 0.76rem;
        color: var(--accent);
      }

      h1 {
        margin: 0;
        max-width: 12ch;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(3rem, 8vw, 5.2rem);
        line-height: 0.92;
      }

      .hero p:last-child {
        max-width: 64ch;
        color: var(--muted);
        font-size: 1.05rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }

      .card {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 1rem;
        align-items: center;
        text-decoration: none;
        color: inherit;
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 28px;
        padding: 1.4rem;
        box-shadow: 0 28px 70px rgba(4, 10, 22, 0.36);
        transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
        backdrop-filter: blur(16px);
      }

      .card:hover,
      .card:focus-visible {
        transform: translateY(-3px);
        box-shadow: 0 34px 80px rgba(4, 10, 22, 0.42);
        border-color: rgba(251, 191, 36, 0.32);
      }

      .card h2 {
        margin: 0;
        font-size: 1.35rem;
      }

      .card-copy {
        display: grid;
        gap: 0.75rem;
      }

      .card p {
        margin: 0;
        color: var(--muted);
      }

      .kind {
        font-size: 0.8rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .url {
        font-size: 0.83rem;
        word-break: break-word;
      }

      .card span {
        font-weight: 600;
        color: #fff7ed;
      }

      .qr-block {
        display: grid;
        justify-items: center;
        gap: 0.55rem;
      }

      .qr-image {
        display: grid;
        place-items: center;
        width: 132px;
        height: 132px;
        padding: 0.35rem;
        background: #ffffff;
        border-radius: 18px;
        border: 1px solid rgba(15, 23, 42, 0.1);
      }

      .qr-image svg {
        display: block;
        width: 100%;
        height: 100%;
      }

      .qr-label {
        font-size: 0.8rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent);
      }

      @media (max-width: 680px) {
        .card {
          grid-template-columns: 1fr;
        }

        .qr-block {
          justify-items: start;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <p class="eyebrow">Tilt To Edit v0.2.10</p>
        <h1>Choose a demo from the root page</h1>
        <p>
          GitHub Pages now publishes the integrated demo and each focused example
          under one public entry point. Open the experience you want directly
          from here or scan a QR code from desktop to continue on your phone.
        </p>
      </section>
      <section class="grid">
        ${cards.join("")}
      </section>
    </main>
  </body>
</html>`;
}

await run(npmExecutable, ["run", "build:packages"]);

for (const demo of demos) {
  await run(
    npmExecutable,
    ["run", "build", "--workspace", demo.workspace],
    {
      TILT_BASE: `${basePrefix}/${demo.slug}/`,
    },
  );
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const demo of demos) {
  await cp(demo.distDir, resolve(outputDir, demo.slug), { recursive: true });
}

const landingPage = await createLandingPage();
await writeFile(resolve(outputDir, "index.html"), landingPage, "utf8");
await writeFile(resolve(outputDir, ".nojekyll"), "", "utf8");
