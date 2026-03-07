# ADR 0009: Maintain examples and a GitHub Pages demo

- Status: Accepted (Implemented in v0.2.0)
- Date: 2026-03-08

## Context

Tilt interaction is easier to understand through working examples than through API references alone. The project also needs a public demo that stakeholders can try without cloning the repository.

## Decision

Maintain both executable examples and a public static demo.

Repository expectations:

- `examples/react-basic` demonstrates permission handling, calibration, and raw intent display
- `examples/react-stepper` demonstrates discrete editing with explicit confirmation
- `examples/react-list-navigator` demonstrates list navigation with stable tilt zones
- `apps/demo` aggregates the most important flows into a static site suitable for GitHub Pages

The demo must work in two modes:

- live sensor mode on supported mobile devices
- simulator mode for desktop browsers and unsupported environments

## Consequences

Positive outcomes:

- Adoption friction is lower because consumers can start from concrete examples.
- Product conversations can happen around a public demo instead of screenshots.
- The simulator doubles as a developer aid.

Tradeoffs:

- Examples and the demo will need to be updated alongside API changes.
- The static hosting constraints of GitHub Pages must shape the demo build.
