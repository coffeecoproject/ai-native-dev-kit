---
schema_version: 1.0
artifact_type: change-boundary-report
number: 115
slug: init-project-modularity
title: "IntentOS 1.115 init-project modularity refactor"
status: reviewed
created_at: 2026-07-23
intentos_version: 1.113.0
---
# Change Boundary Report: 115-init-project-modularity

## Human Summary

The candidate is limited to the structural split of init-project, its Manifest and runtime declaration wiring, focused tests, task transition, and exact current evidence. No release, production, external operation, or unrelated draft is included.

## Task Ref

`task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e`

## Boundary Level

`CB2_CHECKED`

## Intended Scope

Allowed paths:

- .intentos/verification-runtime-lifecycle.json
- business-rule-closures/115-init-project-modularity.md
- business-universe-coverage-reports/115-init-project-modularity.md
- change-boundary-reports/115-init-project-modularity.md
- change-impact-coverage-reports/115-init-project-modularity.md
- change-impact-coverage-reports/preflight-115-init-project-modularity.md
- closure-decisions/115-init-project-modularity.md
- completion-evidence-reports/115-init-project-modularity.md
- control-effectiveness-reports/115-init-project-modularity.md
- evidence/115-init-project-baseline-tests.log
- evidence/115-init-project-control-inventory.json
- evidence/115-work-queue-transition-tests.log
- evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/cleanup-after.txt
- evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/cleanup-before.txt
- evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/preflight.txt
- evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/resources.txt
- evidence/runtime-runs/vrun-115-init-project-modularity-r2/lifecycle-journal.jsonl
- evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-candidate-verification.log
- evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log
- evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-runtime-behavior.log
- evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-negative.log
- evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-positive.log
- evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-service.log
- execution-assurance-reports/115-init-project-modularity.md
- implementation-plans/115-init-project-modularity.md
- intentos-manifest.json
- package.json
- plan-review-reports/115-init-project-modularity.md
- planning-closure-reports/115-init-project-modularity.md
- review-summaries/115-init-project-modularity-business-universe-challenger.md
- review-surface-cards/115-init-project-modularity.md
- scripts/check-manifest.mjs
- scripts/init-project.mjs
- scripts/init-project/apply.mjs
- scripts/init-project/assets.mjs
- scripts/init-project/cli.mjs
- scripts/init-project/plan.mjs
- task-governance-reports/115-init-project-modularity.md
- test-evidence-reports/115-init-project-modularity.md
- tests/115-init-project-obligation-evidence.test.mjs
- tests/active-guidance-distribution-closeout.test.mjs
- tests/init-project-modularity.test.mjs
- verification-plans/115-init-project-modularity.md
- verification-run-manifests/115-init-project-modularity.md
- verification-runtime-lifecycle-plans/115-init-project-modularity.md
- verification-runtime-plans/115-init-project-modularity.md
- work-queue-takeover-reports/115-init-project-modularity.md
- work-queue-transitions/003-check-intentos-to-init-project-modularity.md
- work-queue/115-init-project-modularity.md

Forbidden paths:

- docs/plans/controlled-adoption-change-attribution-auto-closeout.md
- docs/plans/hosted-automation-default-decoupling-1.114-plan.md

Forbidden change types:

- production release
- external operation
- commit or push

## Actual Changed Files

| File | Change type | Inside boundary | Evidence |
|---|---|---|---|
| .intentos/verification-runtime-lifecycle.json | M / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| business-rule-closures/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| business-universe-coverage-reports/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| change-boundary-reports/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| change-impact-coverage-reports/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| change-impact-coverage-reports/preflight-115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| closure-decisions/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| completion-evidence-reports/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| control-effectiveness-reports/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| evidence/115-init-project-baseline-tests.log | A / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| evidence/115-init-project-control-inventory.json | A / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| evidence/115-work-queue-transition-tests.log | A / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/cleanup-after.txt | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/cleanup-before.txt | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/preflight.txt | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| evidence/runtime-runs/vrun-115-init-project-modularity-r2/evidence/resources.txt | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| evidence/runtime-runs/vrun-115-init-project-modularity-r2/lifecycle-journal.jsonl | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-candidate-verification.log | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-runtime-behavior.log | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-negative.log | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-positive.log | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-service.log | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| execution-assurance-reports/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| implementation-plans/115-init-project-modularity.md | A / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| intentos-manifest.json | M / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| package.json | M / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| plan-review-reports/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| planning-closure-reports/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| review-summaries/115-init-project-modularity-business-universe-challenger.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| review-surface-cards/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| scripts/check-manifest.mjs | M / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| scripts/init-project.mjs | M / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| scripts/init-project/apply.mjs | A / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| scripts/init-project/assets.mjs | A / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| scripts/init-project/cli.mjs | A / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| scripts/init-project/plan.mjs | A / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| task-governance-reports/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| test-evidence-reports/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| tests/115-init-project-obligation-evidence.test.mjs | A / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| tests/active-guidance-distribution-closeout.test.mjs | M / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| tests/init-project-modularity.test.mjs | A / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| verification-plans/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| verification-run-manifests/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| verification-runtime-lifecycle-plans/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| verification-runtime-plans/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| work-queue-takeover-reports/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| work-queue-transitions/003-check-intentos-to-init-project-modularity.md | A / source-file | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |
| work-queue/115-init-project-modularity.md | A / governance-evidence | Yes | Exact staged 1.115 candidate; bound to r2 runtime and current closure evidence. |

## Out-of-Scope Changes

| File | Why out of scope | Required disposition |
|---|---|---|
|  |  |  |

## Human Approval

Required: No
Status: Not Required
Approval scope: Source-only structural governance and evidence generation; no irreversible or external action.
Approval ref: N/A

## Boundary Result

`PASS`

Every staged file is listed in both directions. The two independent drafts remain outside this candidate and stay untracked.

## Verification

`node scripts/check-change-boundary.mjs . --cached --base HEAD --task task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e --report change-boundary-reports/115-init-project-modularity.md`

## Claim Boundary

This report verifies the exact staged source-and-evidence scope only. It does not approve commit, push, release, production, external operations, or unrelated local changes.
