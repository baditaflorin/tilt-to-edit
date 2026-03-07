# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project aims to follow Semantic Versioning.

## [Unreleased]

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
