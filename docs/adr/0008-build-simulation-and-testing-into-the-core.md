# ADR 0008: Build simulation and testing into the core

- Status: Accepted (Implemented in v0.2.0)
- Date: 2026-03-08

## Context

Sensor-driven features are difficult to build if every change requires a physical mobile device. The project also needs a trustworthy way to validate filtering, thresholds, and event generation across future refactors.

## Decision

Treat simulation and deterministic testing as first-class parts of the library design.

The core must support:

- injectable sensor sources for unit and integration testing
- recorded input traces for regression coverage
- a simulator mode that can feed the same engine as real device input

The test strategy should cover:

- pure engine behavior in unit tests
- React adapter behavior in component tests
- manual device validation on a small mobile browser matrix

## Consequences

Positive outcomes:

- Most development can happen without a physical device in hand.
- Regression risk is reduced for threshold and filtering changes.
- The public demo can support desktop users through simulation.

Tradeoffs:

- The architecture must preserve clean seams for injection.
- Test fixtures and trace data will need maintenance.
