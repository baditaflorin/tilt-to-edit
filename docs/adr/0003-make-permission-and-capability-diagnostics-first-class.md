# ADR 0003: Make permission and capability diagnostics first-class

- Status: Accepted (Implemented in v0.2.0)
- Date: 2026-03-08

## Context

Tilt input on the web can fail for multiple reasons: insecure origins, missing API support, denied permission, or permission policy restrictions. A plug-and-play library cannot leave consumers guessing why input is unavailable.

## Decision

Expose runtime status as part of the public API instead of hiding capability checks behind implicit failures. The core will publish a diagnostic state model that can represent at least:

- `unsupported`
- `needs-permission`
- `blocked`
- `active`
- `paused`
- `error`

The API must include an explicit `requestPermission()` entry point for platforms that require a user gesture. Error objects should preserve the underlying browser reason when possible.

## Consequences

Positive outcomes:

- Applications can render clear enablement and recovery UI.
- Embedding issues such as permission policy restrictions become debuggable.
- Support requests should become cheaper to resolve.

Tradeoffs:

- The public API becomes slightly larger.
- Browser-specific edge cases must be normalized into a stable status model.
