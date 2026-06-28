# Spec 240: Standard Baseline Pack Registry

## Source

- Request: `requests/240-standard-baseline-pack-registry.md`
- Preflight: `preflight/240-standard-baseline-pack-registry.md`

## Problem

1.13 baseline pack selection uses industrial pack assets as the primary registry. That blurs ordinary engineering standards and BL2 industrial overlays.

## Expected Behavior

- Add a separate `standard-baseline-packs/` registry.
- Add three draft standard packs: Web runtime, Backend API, Release/Rollback.
- Add read-only resolver and checkers.
- Add CLI commands for standard baseline recommendation and selection checks.
- Keep `baseline-packs` as a read-only umbrella command.
- Keep industrial packs as optional BL2 overlays.
- Keep human approval boundaries explicit.

## Non-Goals

- Do not add full auth, data, observability, supply-chain, accessibility, mobile, or Mini Program standard packs.
- Do not promote draft packs to stable.
- Do not approve target-project writes, implementation, release, production, compliance, security, or privacy.
