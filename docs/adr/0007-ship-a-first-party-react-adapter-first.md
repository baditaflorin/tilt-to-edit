# ADR 0007: Ship a first-party React adapter first

- Status: Accepted (Implemented in v0.2.0)
- Date: 2026-03-08

## Context

The project goal is a reusable library, but the immediate demand is TypeScript and React plug-and-play integration. A direct React surface is needed to validate the core API against realistic application usage.

## Decision

Ship a first-party React adapter as the first framework integration.

The initial React package will expose:

- `useTiltToEdit(options)` for direct access to engine state and controls
- optional primitives such as `TiltStepper`, `TiltSlider`, and `TiltListNavigator`

These React APIs must be thin wrappers over the core package so behavior stays consistent between examples, the demo, and future adapters.

## Consequences

Positive outcomes:

- The most important consumer path gets first-class support.
- Example applications can validate the API quickly.
- React-specific concerns stay isolated from the sensor engine.

Tradeoffs:

- Other frameworks will not get the same level of support in the first milestone.
- UI primitives must be careful not to overconstrain design choices.
