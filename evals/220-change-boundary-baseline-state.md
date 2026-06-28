---
artifact_type: eval
id: 220-change-boundary-baseline-state
status: approved
---

# Eval: 220-change-boundary-baseline-state

## Human Summary

Evaluate whether 1.12.0 makes change scope, guided delivery, and baseline state directly checkable without adding automatic authority.

## Spec Ref

- `specs/220-change-boundary-baseline-state.md`

## Required Evidence

- Syntax:
  - `node --check scripts/check-guided-delivery-loop.mjs`
  - `node --check scripts/check-change-boundary.mjs`
  - `node --check scripts/check-baseline-state.mjs`
  - `node --check scripts/init-project.mjs`
  - `node --check scripts/new-workflow-item.mjs`
  - `node --check scripts/check-dev-kit.mjs`
- Positive examples:
  - `node scripts/check-guided-delivery-loop.mjs examples/1.12-change-boundary-baseline-state`
  - `node scripts/check-change-boundary.mjs examples/1.12-change-boundary-baseline-state --report change-boundary-reports/001-appointment-first-slice.md`
  - `node scripts/check-baseline-state.mjs examples/1.12-change-boundary-baseline-state --report baseline-state-reports/001-no-code-baseline.md`
- Negative fixtures:
  - D3/D4 implementation claim must fail.
  - Parking-lot executable item must fail.
  - Forbidden changed path must fail.
  - Confirmed no-code baseline without evidence must fail.
- Full checks:
  - `node scripts/check-manifest.mjs`
  - `node scripts/check-dev-kit.mjs`
  - `npm run verify`
  - `git diff --check`

## Claim Boundary

Passing this eval proves dev-kit source and workflow hardening only. It does not prove production adoption, platform industrial completeness, real customer delivery, or external reviewer automation.
