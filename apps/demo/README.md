# Demo App

This directory contains the public demo application.

Implemented goals:

- run as a static site so it can be deployed to GitHub Pages
- mirror the core example scenarios in one place
- support both live mobile sensors and a desktop simulator mode
- act as the primary manual QA surface before releases
- provide a Docker image target for server-side deployment

The demo is treated as a consumer of the workspace packages, not as a special-case implementation.
