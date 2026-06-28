---
artifact_type: task
id: 210-governance-hardening-drift-guard
status: approved
---

# Task: 210-governance-hardening-drift-guard

## Human Summary

Implement the 1.11.0 hardening plan and verify it through self-check.

## Spec Ref

- `specs/210-governance-hardening-drift-guard.md`

## Eval Ref

- `evals/210-governance-hardening-drift-guard.md`

## Implementation Steps

1. Add `docs/governance-hardening-drift-guard-1.11-plan.md`.
2. Update README release pointers.
3. Add direct init non-empty guard and `--force-new-project`.
4. Add manifest reverse drift guard.
5. Require meaningful release section bodies in claim/product checks.
6. Add `npm run verify`.
7. Update version, manifest, release evidence, and self-check coverage.
8. Run verification and record results.

## Human Approval

Status: Approved

Approval scope: dev-kit workflow/source hardening only.

