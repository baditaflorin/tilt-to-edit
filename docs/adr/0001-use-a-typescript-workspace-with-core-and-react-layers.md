# ADR 0001: Use a TypeScript workspace with core and React layers

- Status: Accepted (Implemented in v0.2.0)
- Date: 2026-03-08

## Context

The project needs to ship a reusable tilt-input library that can work across multiple applications, while the near-term target is React. The repository is starting from scratch, so the initial structure needs to encourage a clean separation between sensor processing logic and framework integration.

## Decision

Use a TypeScript workspace organized around layered packages:

- `packages/core` for the framework-agnostic sensor and intent engine
- `packages/react` for React hooks and opinionated UI helpers
- `examples/*` for focused consumer apps
- `apps/demo` for the public GitHub Pages demo
- `docs/adr` for long-lived architectural decisions

The core package owns browser capability detection, calibration, filtering, and semantic edit intent. Framework adapters must depend on the core package rather than reimplement its behavior.

## Consequences

Positive outcomes:

- The most volatile logic lives in one reusable core.
- React can move quickly without making the engine React-specific.
- Future adapters for other frameworks remain possible.

Tradeoffs:

- Workspace management adds some upfront setup overhead.
- Shared tooling must be configured before implementation starts.
