# 1.18.0 Guided Baseline Selection Calibration Plan

## Purpose

1.18.0 calibrates the Guided Baseline Selection flow after read-only trials on
real local projects.

The goal is not to add more baseline packs. The goal is to make Codex explain
baseline choices more accurately and with less user guesswork.

## Inputs

The phase is based on sanitized calibration evidence in:

- `baseline-calibration-reports/2026-06-28-summary.md`
- `baseline-calibration-reports/2026-06-28-local-miniprogram-payment-project.md`
- `baseline-calibration-reports/2026-06-28-local-production-governed-web-project.md`
- `baseline-calibration-reports/2026-06-28-local-ios-backend-project.md`
- `baseline-calibration-reports/2026-06-28-local-ios-industrial-monorepo-project.md`

## Scope

1.18.0 updates:

- BL1 safe-action versus BL2 target-candidate language
- platform state vocabulary for large monorepos
- Mini Program cloud-function backend-scope detection
- internal-admin signal precision
- baseline decision card template and review checklist
- self-check coverage for the calibration cases

## Required Behavior

### BL1 / BL2 Language

High-risk and production-sensitive projects must not show BL2 as if it were
already active.

Use:

```text
Current safe action: BL1/read-only mapping
Target candidate level: BL2_INDUSTRIAL after evidence and human confirmation
```

Dirty worktrees must use:

```text
Current safe action: read-only until worktree decision
Target candidate level: BL2_INDUSTRIAL only if high-risk evidence remains relevant
```

### Platform States

Baseline Decision Cards should distinguish:

- `selected-confirmed`
- `selected-inferred`
- `present-needs-confirmation`
- `present-inactive-or-deferred`
- `not-detected`

This is especially important for monorepos where a platform directory exists
but is not necessarily active for the current phase.

### Mini Program Cloud Functions

Mini Program cloud functions should not force the full backend baseline.

They should set backend/API scope to:

```text
possible; Mini Program cloud functions need confirmation
```

### Internal Admin

Permission, RBAC, login, or backend vocabulary alone must not infer
`internal-admin`.

Internal admin requires stronger evidence such as admin pages, dashboard routes,
approval flows, operations console, platform admin, merchant admin, or admin
scripts.

## Non-Goals

- Do not add new baseline packs.
- Do not promote draft packs.
- Do not make BL2 default.
- Do not enable industrial packs automatically.
- Do not approve target-project writes.
- Do not approve implementation, release, production, security, privacy,
  compliance, payment, finance, tax, HR, migration, or irreversible data
  decisions.
- Do not claim real-project production validation.

## Verification

Required checks:

```bash
node scripts/cli.mjs baseline-decision .
node scripts/cli.mjs baseline .
node scripts/cli.mjs baseline-decision-check .
node scripts/check-guided-baseline-selection.mjs examples/1.17-guided-baseline-selection/new-miniprogram --strict
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

## Release Boundary

1.18.0 changes recommendation wording and detection precision. It does not
change target-project write authority.

