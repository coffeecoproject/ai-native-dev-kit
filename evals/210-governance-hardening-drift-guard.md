---
artifact_type: eval
id: 210-governance-hardening-drift-guard
status: approved
---

# Eval: 210-governance-hardening-drift-guard

## Human Summary

Evaluate whether 1.11.0 prevents the specific drift and misuse risks identified after 1.10.

## Spec Ref

- `specs/210-governance-hardening-drift-guard.md`

## Required Evidence

- Syntax:
  - `node --check scripts/init-project.mjs`
  - `node --check scripts/check-manifest.mjs`
  - `node --check scripts/check-claim-control.mjs`
  - `node --check scripts/check-product-baseline.mjs`
  - `node --check scripts/check-intentos.mjs`
- Manifest:
  - `node scripts/check-manifest.mjs`
- Full self-check:
  - `node scripts/check-intentos.mjs`
- Release-level verify:
  - `npm run verify`
- Diff hygiene:
  - `git diff --check`

## Negative Coverage

- Non-empty direct init without force must fail.
- Manifest reverse drift must fail when an important source asset is removed from manifest coverage.
- Empty release claim sections must fail claim control.

## Claim Boundary

Passing this eval proves source-level hardening only. It does not prove production adoption or customer delivery readiness.

