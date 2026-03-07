# ADR 0010: Track releases with SemVer and a changelog

- Status: Accepted (Implemented in v0.2.0)
- Date: 2026-03-08

## Context

The repository needs a disciplined way to communicate versions and changes as the library evolves from planning into implementation. Because the API will likely iterate quickly before 1.0, release history must make breaking changes and example/demo updates easy to track.

## Decision

Adopt Semantic Versioning and maintain `CHANGELOG.md` in the root of the repository.

Release policy:

- start in the `0.x` range until the public API is stable
- document all notable changes under `Unreleased` before publishing
- record released versions with dated entries
- call out breaking changes, new features, fixes, and documentation or demo changes explicitly

The changelog is the authoritative public summary of what changed between versions.

## Consequences

Positive outcomes:

- Consumers get a predictable release history.
- Breaking changes are visible during the pre-1.0 phase.
- Examples and demo updates can be tracked alongside library changes.

Tradeoffs:

- Release discipline adds process overhead.
- The changelog must be maintained continuously to stay useful.
