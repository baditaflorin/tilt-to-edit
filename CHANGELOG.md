# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project aims to follow Semantic Versioning.

## [Unreleased]

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
