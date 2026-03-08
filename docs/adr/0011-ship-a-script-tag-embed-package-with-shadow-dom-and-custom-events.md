# ADR 0011: Ship a script-tag embed package with Shadow DOM and custom events

- Status: Accepted (Implemented in v0.3.0)
- Date: 2026-03-08

## Context

The library currently serves TypeScript and React consumers well, but many websites do not use React and many AI-generated sites need the fastest possible integration path: drop in a single `<script>` tag, add some markup, and start reacting to tilt. If the project stops at framework adapters, adoption stays limited to toolchains that can bundle modules.

An embed surface must work across arbitrary websites, avoid CSS collisions, expose diagnostics and permission flows, and let host pages react to tilt without needing to fork the widget internals.

## Decision

Add a new first-party browser package, `@tilt-to-edit/embed`, with two distribution modes:

- an ESM bundle for direct imports in browser-first code
- an IIFE bundle for `<script src="...">` embeds that exposes `window.TiltToEdit`

The embed package will:

- auto-mount declarative widgets from `[data-tilt-to-edit]`
- render inside Shadow DOM so styles stay isolated from host pages
- dispatch DOM custom events such as `tilt-to-edit:state`, `tilt-to-edit:change`, and `tilt-to-edit:commit`
- expose an imperative API for manual mounting and group actions like permission requests and calibration
- keep the core `TiltEngine` as the single source of sensor, calibration, and intent behavior

## Consequences

Positive outcomes:

- Any site can adopt tilt input without React or a bundler.
- AI-generated pages get a low-friction integration contract based on attributes, globals, and events.
- Host pages can drive their own visuals or business logic from the emitted events.
- Shadow DOM keeps the embed package resilient inside unknown design systems.

Tradeoffs:

- The project now owns a browser-widget surface in addition to the React adapter.
- Documentation and release tooling must ship and test another package and public example.
- The embed API must stay small and predictable, otherwise it becomes a second UI framework.
