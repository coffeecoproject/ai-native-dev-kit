---
schema_version: 1.0
artifact_type: change-boundary-report
number: 127
slug: verified-prior-apply-dirty-overlap
title: "verified prior apply dirty overlap"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
---
# Change Boundary Report: 127-verified-prior-apply-dirty-overlap

## Human Summary

Task 248 is bounded to one controlled-update planning guard, one activation guard, their focused regressions, and the task evidence needed to review the change.

## Task Ref

`tasks/248-verified-prior-apply-dirty-overlap.md`

## Boundary Level

```text
CB2_CHECKED
```

## Intended Scope

Allowed paths:

- `scripts/init-project/plan.mjs`
- `scripts/lib/adoption-apply-chain.mjs`
- `tests/execution-distribution-trust.test.mjs`
- `tests/project-entry-generated-parity.test.mjs`
- `requests/248-verified-prior-apply-dirty-overlap.md`
- `preflight/248-verified-prior-apply-dirty-overlap.md`
- `specs/248-verified-prior-apply-dirty-overlap.md`
- `evals/248-verified-prior-apply-dirty-overlap.md`
- `tasks/248-verified-prior-apply-dirty-overlap.md`
- `change-boundary-reports/127-verified-prior-apply-dirty-overlap.md`
- `review-packets/248-verified-prior-apply-dirty-overlap.md`
- `gpt-review-prompts/248-verified-prior-apply-dirty-overlap.md`
- `review-loop-reports/248-verified-prior-apply-dirty-overlap.md`
- `ai-logs/2026-08-01-verified-prior-apply-dirty-overlap.md`
- `final-reports/248-verified-prior-apply-dirty-overlap.md`

Forbidden paths:

- Pawcode files
- schemas and workflow states
- dependencies, CI, hooks, release, production, or business code

Allowed change types:

- exact prior-transaction overlap proof generation and validation
- focused unit/integration regression coverage
- bounded governance evidence

Forbidden change types:

- broad dirty merge or directory-overlap tolerance
- receipt/authority/readiness redesign
- unrelated refactor or checker-performance rewrite

Expected diff scale:

medium

## Actual Changed Files

| File | Change type | Inside boundary? | Evidence / note |
|---|---|---|---|
| `scripts/init-project/plan.mjs` | implementation | Yes | derives the exact overlap proof from one strictly valid prior transaction |
| `scripts/lib/adoption-apply-chain.mjs` | implementation | Yes | recomputes exact dirty/write overlap and fails closed on incomplete proof |
| `tests/execution-distribution-trust.test.mjs` | test | Yes | positive and negative activation matrix |
| `tests/project-entry-generated-parity.test.mjs` | test | Yes | two-update external-project regression and canonical tamper rejection |
| `requests/248-verified-prior-apply-dirty-overlap.md` | governance | Yes | source request |
| `preflight/248-verified-prior-apply-dirty-overlap.md` | governance | Yes | bounded direction and risks |
| `specs/248-verified-prior-apply-dirty-overlap.md` | governance | Yes | exact proof contract |
| `evals/248-verified-prior-apply-dirty-overlap.md` | governance | Yes | acceptance evidence checklist |
| `tasks/248-verified-prior-apply-dirty-overlap.md` | governance | Yes | execution authority and boundary |
| `change-boundary-reports/127-verified-prior-apply-dirty-overlap.md` | evidence | Yes | this report |
| `review-packets/248-verified-prior-apply-dirty-overlap.md` | evidence | Yes | stable review input |
| `gpt-review-prompts/248-verified-prior-apply-dirty-overlap.md` | evidence | Yes | bound read-only review prompt |
| `review-loop-reports/248-verified-prior-apply-dirty-overlap.md` | evidence | Yes | reviewer outcome and residual risks |
| `ai-logs/2026-08-01-verified-prior-apply-dirty-overlap.md` | evidence | Yes | durable task log |
| `final-reports/248-verified-prior-apply-dirty-overlap.md` | evidence | Yes | final handoff |

## Out-of-Scope Changes

| File | Why out of scope | Required disposition |
|---|---|---|

The pre-existing five local commits are the already-separated source-only adoption hardening baseline and are not part of Task 248's current diff.

## Human Approval

Required: No
Status: Not Required
Approval scope: Not Required
Approval ref: N/A

## Boundary Result

Disposition: `PASS`

Reason: the boundary checker confirmed that the current candidate contains exactly the declared four implementation/test paths and eleven Task 248 governance/evidence paths, with no forbidden or unrelated path.

## Verification

Commands:

```bash
git diff --cached --name-only
node scripts/check-change-boundary.mjs . --report change-boundary-reports/127-verified-prior-apply-dirty-overlap.md
git diff --cached --check
```

## Claim Boundary

This report covers only Task 248 scope conformance. It does not approve a Pawcode apply, commit, push, release, production effect, or checker-performance refactor.
