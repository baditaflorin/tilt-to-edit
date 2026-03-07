# ADR 0002: Use DeviceOrientationEvent as the primary sensor backend

- Status: Accepted (Implemented in v0.2.0)
- Date: 2026-03-08

## Context

The web platform offers multiple motion and orientation APIs, but support is uneven across browsers and devices. The library needs a default backend that maximizes compatibility for mobile web usage while still leaving room for more advanced sensor integrations later.

## Decision

Use `DeviceOrientationEvent` as the default runtime backend for the first release. Treat:

- `gamma` as the default left-right tilt signal
- `beta` as the default up-down tilt signal

Design the core around a backend interface so newer sensor implementations can be added later. Generic Sensor API orientation backends may be implemented as optional enhancements when they provide real compatibility or quality gains.

## Consequences

Positive outcomes:

- The library starts from the most practical browser primitive.
- Consumers avoid waiting for limited-support APIs.
- The input contract stays compatible with secure mobile web apps.

Tradeoffs:

- Raw values will vary across browsers and hardware.
- The engine must compensate for noise, drift, and different device postures.
