# ADR 0005: Convert raw sensor data into semantic edit intent

- Status: Accepted (Implemented in v0.2.0)
- Date: 2026-03-08

## Context

Editing interactions need stability and intentionality. Raw orientation samples are too noisy to expose directly because jitter near neutral can cause accidental changes and overly sensitive controls.

## Decision

The core package will transform raw sensor input into semantic edit intent through a deterministic processing pipeline that includes:

- smoothing to reduce short-term jitter
- dead zones near neutral
- hysteresis to avoid rapid back-and-forth toggling
- rate limiting for repeated step actions
- clamping and bounds enforcement for continuous adjustments

The public output should be semantic events and state, such as:

- `intentVector`
- `moveSelection`
- `adjustValue`
- `adjustValueNormalized`

## Consequences

Positive outcomes:

- Consumers work with editing concepts instead of low-level angles.
- The library can support both discrete and continuous controls.
- Behavior is easier to test with deterministic inputs.

Tradeoffs:

- Tuning defaults will take experimentation across real devices.
- Some advanced consumers may still ask for lower-level access.
