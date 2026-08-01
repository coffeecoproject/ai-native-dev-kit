---
schema_version: 1.0
artifact_type: change-boundary-report
number: 125
slug: dirty-worktree-controlled-activation
title: "dirty worktree controlled activation"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
---
# Change Boundary Report: 125-dirty-worktree-controlled-activation

## Human Summary

Boundary review for dirty worktree controlled activation.

## Task Ref

`tasks/246-dirty-worktree-controlled-activation.md`

## Boundary Level

```text
CB2_CHECKED
```

## Intended Scope

Allowed paths:

- `scripts/lib/adoption-apply-chain.mjs`
- `tests/execution-distribution-trust.test.mjs`
- `requests/246-dirty-worktree-controlled-activation.md`
- `preflight/246-dirty-worktree-controlled-activation.md`
- `specs/246-dirty-worktree-controlled-activation.md`
- `evals/246-dirty-worktree-controlled-activation.md`
- `tasks/246-dirty-worktree-controlled-activation.md`
- `ai-logs/2026-08-01-dirty-worktree-controlled-activation.md`
- `review-packets/246-dirty-worktree-controlled-activation.md`
- `gpt-review-prompts/246-dirty-worktree-controlled-activation.md`
- `review-loop-reports/246-dirty-worktree-controlled-activation.md`
- `change-boundary-reports/125-dirty-worktree-controlled-activation.md`
- `final-reports/246-dirty-worktree-controlled-activation.md`

Forbidden paths:

- Pawcode managed assets
- workflow-next state production, schemas, dependencies, CI/hooks, release, production, and business code

Allowed change types:

- narrow fail-closed predicate
- focused regression tests
- Task 246 evidence

Forbidden change types:

- state widening without exact plan proof
- external effects
- unrelated refactor

Expected diff scale:

small

## Actual Changed Files

| File | Change type | Inside boundary? | Evidence / note |
|---|---|---|---|
| `scripts/lib/adoption-apply-chain.mjs` | implementation | Yes | exact dirty-plan activation predicate |
| `tests/execution-distribution-trust.test.mjs` | tests | Yes | positive and fail-closed cases |
| `requests/246-dirty-worktree-controlled-activation.md` | governance | Yes | request evidence |
| `preflight/246-dirty-worktree-controlled-activation.md` | governance | Yes | preflight evidence |
| `specs/246-dirty-worktree-controlled-activation.md` | governance | Yes | contract evidence |
| `evals/246-dirty-worktree-controlled-activation.md` | governance | Yes | evaluation evidence |
| `tasks/246-dirty-worktree-controlled-activation.md` | governance | Yes | task boundary |
| `ai-logs/2026-08-01-dirty-worktree-controlled-activation.md` | governance | Yes | execution log |
| `review-packets/246-dirty-worktree-controlled-activation.md` | governance | Yes | review input |
| `gpt-review-prompts/246-dirty-worktree-controlled-activation.md` | governance | Yes | read-only review prompt |
| `review-loop-reports/246-dirty-worktree-controlled-activation.md` | governance | Yes | review closure |
| `change-boundary-reports/125-dirty-worktree-controlled-activation.md` | governance | Yes | boundary proof |
| `final-reports/246-dirty-worktree-controlled-activation.md` | governance | Yes | bounded final report |

## Out-of-Scope Changes

| File | Why out of scope | Required disposition |
|---|---|---|
No out-of-scope changes.

## Human Approval

Required: No
Status: Not Required
Approval scope: Not Required
Approval ref:

## Boundary Result

Disposition: `PASS`

Reason: Every changed file is listed inside the CB2 task boundary.

## Verification

Commands:

```bash
git diff --name-only
node scripts/check-change-boundary.mjs . --report change-boundary-reports/125-dirty-worktree-controlled-activation.md
```

## Claim Boundary

This report does not approve implementation, release, production, risk acceptance, or target-project writes.
