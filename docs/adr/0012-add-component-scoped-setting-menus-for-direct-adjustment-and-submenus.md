# ADR 0012: Add component-scoped setting menus for direct adjustment and submenus

- Status: Accepted (Implemented in v0.4.0)
- Date: 2026-03-08

## Context

The library already supports browse-and-commit interactions well, but settings UIs often need a denser workflow:

- browse to a setting
- adjust that setting immediately without leaving the control
- optionally drill into a deeper submenu where the same tilt axis changes meaning based on the current mode

This matters for plug-and-play adoption because many product settings are not simple one-shot selections. Consumers need reusable primitives for brightness, contrast, volume, and nested control panels without rebuilding their own gesture state machines on top of raw `intentVector` and `stepEvents`.

There are multiple viable interaction models:

1. A direct two-axis editor where vertical tilt changes focus and horizontal tilt changes the focused value.
2. A hierarchical editor where right tilt moves deeper into a submenu, left tilt moves back out, and vertical tilt edits only when the user is inside the editing layer.
3. A global page-level controller that rewires the whole screen instead of a single component.

## Decision

Add two first-party React primitives built on the existing engine:

- `TiltSettingsAdjuster`
  - vertical tilt browses between settings
  - horizontal tilt decreases or increases the focused value
  - value changes apply at the component level, not the whole page

- `TiltSubmenuEditor`
  - vertical tilt browses sections at level one
  - right tilt enters the item list for the current section
  - right tilt again enters value editing for the current item
  - while editing, vertical tilt increases or decreases the current value
  - left tilt backs out one level at a time

Both primitives will use shared setting models so consumers can pass item metadata such as `min`, `max`, `step`, `unit`, `description`, and custom value formatters. The core `TiltEngine` will stay unchanged because it already exposes the right building blocks:

- normalized two-axis intent vectors
- per-axis step events
- calibration and orientation handling
- permission and diagnostics state

The new API surface belongs in the React adapter, not the core package, because these behaviors are UI state machines rather than sensor abstractions.

## Consequences

Positive outcomes:

- The library gains reusable controls for real settings panels instead of only selection widgets.
- Consumers can choose between direct adjustment and explicit hierarchical editing depending on error tolerance and information density.
- The React adapter becomes a more complete plug-and-play surface for AI-generated or human-built settings pages.
- The project can demonstrate a three-part menu model without changing the low-level engine contract.

Tradeoffs:

- The React package now owns more opinionated interaction state on top of the same engine.
- Documentation must explain the difference between browse, adjust, and submenu-edit modes clearly.
- Component tests need to cover mode transitions, value updates, and back-out behavior so regressions stay visible.

Rejected alternatives:

- Extending the core engine with submenu concepts. Rejected because submenu depth is a UI concern, not a sensor concern.
- Making the whole page a single global controller. Rejected as the default because component-scoped controls are easier to embed safely into existing products.
- Replacing the existing `TiltMenuSelector`. Rejected because browse-and-commit still fits lightweight selection tasks better than value editing.
