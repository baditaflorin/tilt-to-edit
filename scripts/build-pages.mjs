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
      "One shell that combines the sensor console, simulator, stepper, slider, and list navigator.",
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
      "Discrete left-right tilt editing with step events and explicit confirmation.",
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
        color-scheme: light;
        --ink: #10233d;
        --muted: #475569;
        --panel: rgba(255, 255, 255, 0.84);
        --accent: #c2410c;
        --line: rgba(15, 23, 42, 0.08);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Avenir Next", "Segoe UI", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(245, 158, 11, 0.2), transparent 28%),
          radial-gradient(circle at right 20%, rgba(14, 165, 233, 0.14), transparent 24%),
          linear-gradient(180deg, #f8fbff 0%, #edf4f7 100%);
      }

      main {
        max-width: 1160px;
        margin: 0 auto;
        padding: 3rem 1.25rem 4rem;
      }

      .hero {
        display: grid;
        gap: 1rem;
        margin-bottom: 2rem;
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
        font-size: clamp(2.8rem, 7vw, 5rem);
        line-height: 0.94;
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
        border-radius: 24px;
        padding: 1.4rem;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
        transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
      }

      .card:hover,
      .card:focus-visible {
        transform: translateY(-3px);
        box-shadow: 0 28px 64px rgba(15, 23, 42, 0.12);
        border-color: rgba(194, 65, 12, 0.24);
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
        <p class="eyebrow">Tilt To Edit v0.2.4</p>
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
