# ADR 0004: Normalize input around calibration and screen orientation

- Status: Accepted (Implemented in v0.2.0)
- Date: 2026-03-08

## Context

Raw tilt values are only meaningful relative to how the user is holding the device. A library intended for editing must support a comfortable neutral pose and keep left-right or up-down behavior consistent across portrait and landscape use.

## Decision

Make calibration and screen-aware normalization mandatory parts of the input pipeline.

The core will:

- capture a neutral pose on demand
- compute tilt deltas relative to that neutral pose
- adjust axes for screen orientation
- produce a normalized two-dimensional intent vector that higher-level controls can consume

Recalibration will be supported as a public operation so applications can offer a reset action whenever the device posture changes.

## Consequences

Positive outcomes:

- Users can hold the device naturally instead of aiming for a hard-coded angle.
- Control behavior becomes more predictable across portrait and landscape modes.
- Example applications can share one normalization contract.

Tradeoffs:

- A calibration step must be designed into onboarding.
- Orientation-change handling adds more state to the core.
