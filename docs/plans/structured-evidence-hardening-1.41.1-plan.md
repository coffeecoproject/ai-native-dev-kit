# Structured Evidence Hardening 1.41.1 Plan

## Goal

Harden the 1.41 structured evidence chain without changing the default compatibility model.

1.41.1 turns reviewer feedback into bounded improvements:

- fix stale release evidence status;
- add optional strict structured evidence mode;
- require local plan reference resolution in strict readiness and approval checks;
- reject structured readiness records that claim a non-`NO_APPLY_PLAN` state with no actions;
- document that schemas alone are not the safety boundary.

## Scope

In scope:

- `check-apply-plan.mjs`
- `check-controlled-apply-readiness.mjs`
- `check-approval-record.mjs`
- `scripts/lib/artifact-schema.mjs`
- structured evidence docs and release records
- bad fixtures for strict mode and readiness empty actions

Out of scope:

- controlled apply runner
- automatic writes
- hook or CI installation
- production/release approval
- human identity verification
- replacing Markdown compatibility fallback
- replacing the lightweight local validator with a full JSON Schema engine

## Compatibility Rule

Default checker behavior remains compatible with historical Markdown artifacts.

Strict behavior is explicit:

```bash
node scripts/check-apply-plan.mjs <project> --require-structured-evidence
node scripts/check-controlled-apply-readiness.mjs <project> --require-structured-evidence
node scripts/check-approval-record.mjs <project> --require-structured-evidence
```

## Acceptance Criteria

- Legacy examples still pass default checks.
- 1.41 structured examples pass default and strict checks.
- Strict mode rejects artifacts without `Machine-Readable Evidence`.
- Strict readiness and approval checks reject missing local plan references.
- Structured readiness rejects empty actions unless `readiness_state` is `NO_APPLY_PLAN`.
- `check-intentos`, `check-fixtures`, governance checks, syntax checks, and diff checks pass.

## Boundary

This plan does not authorize apply, write target project files, approve implementation, approve release or production, install hooks, modify CI, change source of truth, enable BL2, or enable industrial packs.
