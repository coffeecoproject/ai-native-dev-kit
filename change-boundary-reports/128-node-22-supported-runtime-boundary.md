---
schema_version: 1.0
artifact_type: change-boundary-report
number: 128
slug: node-22-supported-runtime-boundary
title: "node 22 supported runtime boundary"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
---
# Change Boundary Report: 128-node-22-supported-runtime-boundary

## Human Summary

Task 249 is bounded to correcting the supported Node major declaration, its user and maintainer guidance, one self-check assertion, and the evidence needed to review that correction.

## Task Ref

`tasks/249-node-22-supported-runtime-boundary.md`

## Boundary Level

```text
CB2_CHECKED
```

## Intended Scope

Allowed paths:

- `package.json`
- `README.md`
- `README.zh-CN.md`
- `CONTRIBUTING.md`
- `docs/source-only-adoption.md`
- `docs/for-maintainers.md`
- `scripts/self-check/foundation.mjs`
- `requests/249-node-22-supported-runtime-boundary.md`
- `preflight/249-node-22-supported-runtime-boundary.md`
- `specs/249-node-22-supported-runtime-boundary.md`
- `evals/249-node-22-supported-runtime-boundary.md`
- `tasks/249-node-22-supported-runtime-boundary.md`
- `change-boundary-reports/128-node-22-supported-runtime-boundary.md`
- `review-packets/249-node-22-supported-runtime-boundary.md`
- `gpt-review-prompts/249-node-22-supported-runtime-boundary.md`
- `review-loop-reports/249-node-22-supported-runtime-boundary.md`
- `ai-logs/2026-08-01-node-22-supported-runtime-boundary.md`
- `final-reports/249-node-22-supported-runtime-boundary.md`

Forbidden paths:

- `.github/workflows/**`
- adoption, apply, receipt, target-project, dependency, release and production paths

Allowed change types:

- runtime compatibility declaration
- documentation alignment
- one exact self-check assertion
- bounded governance evidence

Forbidden change types:

- Node 23 compatibility repair
- checker-DAG refactor
- CI workflow, dependency, source-only behavior, release or production change

Expected diff scale:

small

## Actual Changed Files

| File | Change type | Inside boundary? | Evidence / note |
|---|---|---|---|
| `package.json` | runtime contract | Yes | bounds the supported engine to `>=22 <23` |
| `README.md` | documentation | Yes | English prerequisite now states Node 22.x |
| `README.zh-CN.md` | documentation | Yes | Chinese prerequisite now states Node 22.x |
| `CONTRIBUTING.md` | maintainer guidance | Yes | repository checks use the same Node 22 boundary |
| `docs/source-only-adoption.md` | adoption guidance | Yes | source users no longer receive an open-ended support claim |
| `docs/for-maintainers.md` | maintainer guidance | Yes | formal verification boundary and newer-major treatment are explicit |
| `scripts/self-check/foundation.mjs` | self-check | Yes | fails if package engine drifts from the bounded range |
| `requests/249-node-22-supported-runtime-boundary.md` | governance | Yes | source request |
| `preflight/249-node-22-supported-runtime-boundary.md` | governance | Yes | bounded direction and risks |
| `specs/249-node-22-supported-runtime-boundary.md` | governance | Yes | supported runtime contract |
| `evals/249-node-22-supported-runtime-boundary.md` | governance | Yes | acceptance evidence checklist |
| `tasks/249-node-22-supported-runtime-boundary.md` | governance | Yes | execution authority and boundary |
| `change-boundary-reports/128-node-22-supported-runtime-boundary.md` | evidence | Yes | this report |
| `review-packets/249-node-22-supported-runtime-boundary.md` | evidence | Yes | stable review input |
| `gpt-review-prompts/249-node-22-supported-runtime-boundary.md` | evidence | Yes | bound read-only review prompt |
| `review-loop-reports/249-node-22-supported-runtime-boundary.md` | evidence | Yes | reviewer outcome and residual risk |
| `ai-logs/2026-08-01-node-22-supported-runtime-boundary.md` | evidence | Yes | durable task log |
| `final-reports/249-node-22-supported-runtime-boundary.md` | evidence | Yes | final handoff |

## Out-of-Scope Changes

| File | Why out of scope | Required disposition |
|---|---|---|

None.

## Human Approval

Required: No
Status: Not Required
Approval scope: Not Required
Approval ref: User instruction on 2026-08-01 to perform the first two closeout steps

## Boundary Result

Disposition: `PASS`

Reason: the exact 7 contract/documentation/self-check files and 11 Task 249 evidence files are all inside the approved boundary; no workflow, Node 23 repair, dependency, target-project, release, or production path changed.

## Verification

Commands:

```bash
git diff --cached --name-only
node scripts/check-change-boundary.mjs . --report change-boundary-reports/128-node-22-supported-runtime-boundary.md
git diff --cached --check
```

## Claim Boundary

This report does not approve implementation, release, production, risk acceptance, or target-project writes.
