# ADR 0006: Require explicit commit for destructive or final edits

- Status: Accepted (Implemented in v0.2.0)
- Date: 2026-03-08

## Context

Tilt is good for highlighting, navigating, or proposing a value, but it is not reliable enough to serve as the sole commit action for meaningful edits. Users need a way to confirm intent and avoid accidental changes caused by motion or posture shifts.

## Decision

Adopt a two-step interaction model:

- tilt is used to navigate or propose a value
- a separate explicit action commits the selection

The first release will treat tap, press, or hold-based confirmation as the recommended commit path. Controls may also support an "armed" mode where tilt only affects values while the user is actively pressing a control.

## Consequences

Positive outcomes:

- The editing model is safer and easier to explain.
- The same core can support one-handed and accessibility-oriented flows.
- Applications can choose the least risky confirmation pattern for their use case.

Tradeoffs:

- One extra interaction is required for completion.
- Some lightweight demo interactions may feel slower than tilt-only prototypes.
