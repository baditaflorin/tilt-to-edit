# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project aims to follow Semantic Versioning.

## [Unreleased]

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
