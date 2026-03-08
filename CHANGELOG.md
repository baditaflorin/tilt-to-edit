# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project aims to follow Semantic Versioning.

## [Unreleased]

## [0.3.2] - 2026-03-08

### Fixed

- Changed the default continuous slider sensitivity from a narrow fixed window to the full configured value span, so left-right tilt can drive the entire slider range by default.
- Applied the same full-span preview behavior to the live slider monitor in the integrated demo and the browser embed slider path.

## [0.3.1] - 2026-03-08

### Changed

- Reworked the shared primitive telemetry layout into a compact metrics grid so status and intent blocks no longer look like selectable menu items.
- Applied the new instrumentation styling across the stepper, slider, list navigator, and menu selector so control chrome reads differently from the actual interactive rows.

### Changed

- Added direct GitHub fork/source links to the integrated demo and README, plus maintainer contact details for Florin Badita.

## [0.3.0] - 2026-03-08

### Added

- Added `ADR 0011`, which commits the project to a script-tag browser embed surface built on Shadow DOM and custom events.
- Added `@tilt-to-edit/embed`, a new package that ships an ESM bundle, an IIFE bundle for `<script src="...">`, declarative auto-mounting, and the global `window.TiltToEdit` API.
- Added a new public `/embed/` example that uses the browser bundle to drive a host-page scene remix and auto-mounted menu widget without React.

### Changed

- Expanded the build, typecheck, Pages, and versioning pipeline so the embed package and the new example ship alongside the existing React surfaces.

## [0.2.13] - 2026-03-08

### Added

- Added `TiltSceneRemixCard` to the integrated `/demo/` app so horizontal tilt swaps backdrops and vertical tilt swaps characters in a live scene-style preview.

### Changed

- Polished the integrated demo copy so the new image-style remix interaction is presented alongside the existing stepper, slider, list, and hybrid menu examples.

### Fixed

- Added regression coverage for the new scene-remix card and tightened the metric lookup helper so repeated labels inside the preview UI do not break the test.

## [0.2.12] - 2026-03-08

### Added

- Expanded the standalone `React List Navigator` page so it now includes the hybrid `TiltMenuSelector` example as a direct comparison on the same route.

### Changed

- Updated the `/list/` demo copy and layout to frame it as a comparison between browse-first navigation and browse-plus-select interaction.

## [0.2.11] - 2026-03-08

### Fixed

- Reworked `React Vector Space` so browsing no longer races to the ends of the menu; it now uses recenter-to-step pacing for more reliable intermediate selections.
- Rebuilt the `/space/` scene with a cleaner mobile-first card stack and reduced perspective distortion so the menu reads clearly on phones.

## [0.2.10] - 2026-03-08

### Changed

- Reworked `React Vector Space` from a free-floating telemetry chamber into a 3D browse-and-select menu.
- The `/space/` demo now mirrors the hybrid control language from the main demo: vertical tilt browses, right tilt commits, and left tilt returns to the current selection.
- Updated the Pages landing copy and example documentation so the 3D demo is described as a spatial menu rather than a pure visualizer.

## [0.2.9] - 2026-03-08

### Added

- A new `React Vector Space` example and Pages route at `/space/` that renders tilt intent inside a 3D chamber.
- Glowing intent and velocity beams whose color and intensity change with movement direction and speed.
- Trail rendering that keeps recent motion history visible in the new 3D example.

## [0.2.8] - 2026-03-08

### Added

- `TiltMenuSelector`, a hybrid control that browses vertically, commits with a right tilt, and returns to the current selection with a left tilt.
- A new `React Menu Selector` example and Pages entry point at `/menu/`.
- Test-only backend injection across the public demos and examples so simulator coverage remains available without exposing simulator UI.

### Changed

- Removed simulator controls from the public demo and example applications so the published experiences focus on live-device behavior.
- Refreshed the demo and example visual design with a darker, more atmospheric presentation.

## [0.2.7] - 2026-03-08

### Fixed

- Improved device-orientation availability detection for iOS-style environments that expose `ondeviceorientation` and permission gating through `DeviceMotionEvent.requestPermission()`.
- Made `TiltStepper` react to smaller horizontal tilt by lowering its default discrete step threshold, which improves left-right editing on iPhone browsers.
- Replaced the generic "supported mobile browser" copy in the live examples with explicit iPhone and iPad permission instructions.

## [0.2.6] - 2026-03-08

### Fixed

- Added a compact live slider monitor near the top of the integrated demo so switching from `Simulator` to `Live device` does not hide the only visible slider feedback on mobile.

### Added

- Demo-level regression coverage that verifies live mode renders the top-of-page slider monitor.

## [0.2.5] - 2026-03-08

### Fixed

- Changed `TiltSlider` to preview position updates directly from tilt intent by default, which fixes the demo slider appearing frozen while `Intent X` changes.

### Changed

- The shared primitive controls now only show the arm toggle when a component explicitly requires arm mode.

## [0.2.4] - 2026-03-08

### Fixed

- Added live device mode to the standalone React stepper and React list navigator examples so they behave correctly on mobile, not just in simulator mode.

### Added

- Example-level tests that verify the standalone stepper and list navigator demos expose both `Simulator` and `Live device` modes and still respond to simulator input.

## [0.2.3] - 2026-03-08

### Added

- QR codes for each public GitHub Pages demo on the root landing page so desktop users can scan directly into the live mobile experiences.

### Changed

- The branch-served landing page now shows each demo's public URL alongside the direct link and scan target.

## [0.2.2] - 2026-03-08

### Fixed

- Published the generated GitHub Pages bundle at the repository root with `.nojekyll` so `/basic/`, `/stepper/`, `/list/`, and `/demo/` work under the repository's current branch-based Pages setup.

### Added

- `npm run publish:pages:branch` to build the composed Pages artifact and sync it into the branch-served root paths.

## [0.2.1] - 2026-03-08

### Added

- GitHub Pages landing page that exposes direct links to the integrated demo and each standalone example.
- Multi-build Pages packaging script that publishes `/demo/`, `/basic/`, `/stepper/`, and `/list/` under one artifact.

### Changed

- GitHub Pages deployment now uploads a composed static bundle instead of only the single demo app.

## [0.2.0] - 2026-03-08

### Added

- npm workspace with publishable `@tilt-to-edit/core` and `@tilt-to-edit/react` packages.
- Core tilt engine with browser and simulator backends, capability diagnostics, permission handling, calibration, smoothing, dead zones, hysteresis, step events, and confirmation state.
- React hook and first-party `TiltStepper`, `TiltSlider`, and `TiltListNavigator` primitives.
- Runnable example applications for the basic hook flow, stepper editing, and list navigation.
- Public demo app prepared for GitHub Pages deployment.
- Vitest and Testing Library coverage for the core engine and React integration.
- GitHub Actions workflows for CI, GitHub Pages deployment, and publishing the demo container image.
- Demo container build target served by Nginx for server-side `docker pull` deployments.
