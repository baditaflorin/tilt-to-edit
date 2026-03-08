# tilt-to-edit

`tilt-to-edit` is a TypeScript-first library for using device tilt as an intentional editing input in web applications. It turns raw orientation data into stable edit intent for sliders, steppers, list navigation, and similar controls.

## Status

`v0.2.0` implements ADR 0001 through ADR 0010. `v0.2.1` adds a GitHub Pages landing page, `v0.2.2` publishes that static bundle at the repository root so the live Pages URLs work with the repository's current branch-based Pages configuration, `v0.2.3` adds QR codes for each live demo on the landing page, `v0.2.4` brings live device mode to the standalone stepper and list examples, `v0.2.5` makes slider preview track tilt by default while keeping explicit confirmation, `v0.2.6` keeps a live slider monitor visible near the top of the integrated demo when you switch away from simulator mode, `v0.2.7` improves iOS device-orientation detection and makes the stepper react to smaller left-right tilt, `v0.2.8` removes simulator UI from the public demos, adds a hybrid menu selector, and refreshes the demo visuals, and `v0.2.9` adds a 3D vector-space visualizer with glowing motion beams based on speed and velocity.

Implemented surfaces:

- `@tilt-to-edit/core`: backend abstraction, permission diagnostics, calibration, normalization, continuous intent, discrete step events, and simulator support
- `@tilt-to-edit/react`: `useTiltToEdit`, `TiltStepper`, `TiltSlider`, `TiltListNavigator`, and `TiltMenuSelector`
- `examples/*`: runnable consumer apps
- `apps/demo`: the GitHub Pages demo and containerized demo target

Public Pages entry points:

- `/` landing page with direct demo links
- `/` landing page with direct demo links and QR codes for mobile handoff
- `/demo/` integrated demo shell
- `/basic/` React basic example
- `/stepper/` React stepper example
- `/list/` React list navigator example
- `/menu/` React menu selector example
- `/space/` React vector space example

The public Pages site is currently served from the committed static bundle at the repository root so it works with the repository's branch-based GitHub Pages configuration.

## Repository Layout

The repository is organized around a small set of responsibilities:

- `docs/adr/`: architecture decision records for the first released implementation
- `packages/core/`: framework-agnostic tilt engine
- `packages/react/`: React hook and first-party UI primitives
- `examples/`: runnable example applications that show focused integration patterns
- `apps/demo/`: the GitHub Pages demo application and demo container target
- `CHANGELOG.md`: version and release history

## Quick Start

```bash
npm install
npm run verify
npm run dev:demo
```

Useful commands:

- `npm run dev:demo`
- `npm run dev:example:basic`
- `npm run dev:example:stepper`
- `npm run dev:example:list`
- `npm run dev:example:menu`
- `npm run dev:example:space`
- `npm run verify`

## Architecture Decisions

The first shipped implementation is captured in ten ADRs:

1. [ADR 0001](docs/adr/0001-use-a-typescript-workspace-with-core-and-react-layers.md) - Use a TypeScript workspace with core and React layers
2. [ADR 0002](docs/adr/0002-use-deviceorientationevent-as-the-primary-sensor-backend.md) - Use `DeviceOrientationEvent` as the primary sensor backend
3. [ADR 0003](docs/adr/0003-make-permission-and-capability-diagnostics-first-class.md) - Make permission and capability diagnostics first-class
4. [ADR 0004](docs/adr/0004-normalize-input-around-calibration-and-screen-orientation.md) - Normalize input around calibration and screen orientation
5. [ADR 0005](docs/adr/0005-convert-raw-sensor-data-into-semantic-edit-intent.md) - Convert raw sensor data into semantic edit intent
6. [ADR 0006](docs/adr/0006-require-explicit-commit-for-destructive-or-final-edits.md) - Require explicit commit for destructive or final edits
7. [ADR 0007](docs/adr/0007-ship-a-first-party-react-adapter-first.md) - Ship a first-party React adapter first
8. [ADR 0008](docs/adr/0008-build-simulation-and-testing-into-the-core.md) - Build simulation and testing into the core
9. [ADR 0009](docs/adr/0009-maintain-examples-and-a-github-pages-demo.md) - Maintain examples and a GitHub Pages demo
10. [ADR 0010](docs/adr/0010-track-releases-with-semver-and-a-changelog.md) - Track releases with SemVer and a changelog

## Examples and Demo

Runnable examples:

- [examples/react-basic/](https://baditaflorin.github.io/tilt-to-edit/basic/): permission flow, calibration, normalized intent, and confirmation state
- [examples/react-stepper/](https://baditaflorin.github.io/tilt-to-edit/stepper/): discrete step editing with explicit confirmation
- [examples/react-list-navigator/](https://baditaflorin.github.io/tilt-to-edit/list/): vertical list navigation with stable tilt zones
- [examples/react-menu-selector/](https://baditaflorin.github.io/tilt-to-edit/menu/): browse vertically, tilt right to commit, and tilt left to return to the current selection
- [examples/react-vector-space/](https://baditaflorin.github.io/tilt-to-edit/space/): visualize intent and velocity as glowing beams and trails inside a 3D chamber
- [apps/demo/](https://baditaflorin.github.io/tilt-to-edit/demo/): a static demo site for GitHub Pages, plus a container image target for server deployment

The public demos are now live-device-first. Simulator support remains in the core library and test suite, but it is no longer exposed in the public Pages experiences.

## Delivery

GitHub automation included in this repository:

- `.github/workflows/ci.yml`: runs `npm run verify` on pull requests and pushes to `main`
- `.github/workflows/demo-pages.yml`: deploys a multi-demo Pages bundle with a clickable landing page on pushes to `main`
- `.github/workflows/demo-image.yml`: publishes `ghcr.io/<owner>/tilt-to-edit-demo` for server-side `docker pull`

## Change Tracking

All planned and released changes should be recorded in [CHANGELOG.md](CHANGELOG.md).
