# Final Report: 248-verified-prior-apply-dirty-overlap

This report closes the bounded Task 248 source change. It does not authorize commit, push, Pawcode apply, release, or production work.

## Human Decision Summary

Conclusion: The consecutive-update implementation passed all Task 248 checks and is ready for user review, but not yet for commit or reuse in Pawcode.

Recommended choice: A

Can AI continue now: no; the bounded task is complete

What I need from you: Review the staged candidate before authorizing any commit or push.

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Close current task | Record result and stop | Report only | low | Choose when all checks pass |
| B | Run bounded verification | Run the listed checks and update evidence | Evidence/report only | low/medium | Completed |
| C | Route human decision | Stop before risk, release, or scope changes | Decision/report only | medium/high | Not needed now |
| D | Open a new request | Treat follow-up as separate work | New request/report only | low/medium | Use for Pawcode validation or checker DAG work |

Recommended reason: focused consecutive-update/tamper integration, execution/distribution 72/72, Project Entry 114/114, and the full source self-check all pass.

What happens if you do nothing: The verified source candidate remains staged and uncommitted; Pawcode's stale v4 remains correctly unusable.

## Human Summary

One-sentence conclusion: IntentOS now has a verified, bounded transaction-ownership rule for consecutive controlled updates.

## Completed

- Derive a canonical proof only for the current dirty/write intersection.
- Bind proof to the newest valid prior receipt, its plan, action IDs, and current hashes.
- Require exact managed updates and reject inexact, stale, malformed, or directory overlap.
- Add unit, consecutive-update, business-preservation, and re-digested tamper regressions.

## Verified

| Check | Command / Evidence | Result |
|---|---|---|
| syntax and diff | Node syntax plus `git diff --check` | PASS |
| focused consecutive update | generated external project, two applies, tamper attempt | PASS 1/1 |
| execution/distribution | `node --test tests/execution-distribution-trust.test.mjs` | PASS 72/72 |
| Pawcode evidence | strict v3 receipt plus read-only stale v4 inspection | PASS / v4 REJECTED |
| final Project Entry | `npm run verify:project-entry` | PASS 114/114 |
| full source self-check | Node 22.22.3: `node scripts/check-intentos.mjs` | PASS — `IntentOS self-check passed.` |

## Not Changed

- Pawcode files, business code, existing dirty work, or stale v4.
- Receipt/authority/readiness schemas, workflow states, dependencies, CI/hooks, release, production, or external state.
- The checker graph; its repeated validation cost is recorded separately.

## Change Boundary

Change-boundary report: `change-boundary-reports/127-verified-prior-apply-dirty-overlap.md`

Unexpected files changed: No

Boundary disposition: PASS

## Baseline State

Baseline-state report: Not required

Baseline overclaim found: No

No-code or evidence-required baselines were treated as confirmed: No

## Risks Remaining

- A fresh Pawcode plan/apply has not been performed and is outside Task 248; v4 cannot be reused.
- Full verification remains slow because the checker graph repeats upstream validations.
- Node 23.11.0 deadlocked during V8 worker shutdown in the full-check graph; Node 22.22.3 completed the unchanged candidate successfully. Runtime/checker-DAG hardening is separate follow-up debt.
- Generic Baseline `implementation` mode is not applicable to this BL0/L2 source-repository task because it requires consumer-project platform/industrial selections; current-task `ready` enforcement plus source self-check is the governing route.

## Current Mainline And Parking Lot

| Item | Placement | Status | Re-entry path |
|---|---|---|---|
| Task 248 | Current Mainline | Closed; staged for user review | user review before commit/push |
| Fresh Pawcode plan/apply | Parking Lot | Not started; v4 stale | new request after source closeout |
| Checker DAG/shared validation | Parking Lot | Diagnosed performance debt | new request |

## Assumption Register

| Assumption | Evidence | Confidence | Can proceed? | Needs human confirmation? | Owner | Status |
|---|---|---|---|---|---|---|
| v4 must not be reused | missing new canonical proof and canonical rebuild requirement | high | Yes | No | AI | CONFIRMED |

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N2 | DIRECT_FOLLOW_UP | generate a fresh Pawcode plan after source selection | consumer confirmation | No | new request | Pawcode write; never reuse v4 |
| N3 | OUT_OF_SCOPE_OBSERVATION | replace repeated checker spawns with an explicit validation DAG | performance debt | No | new request | architecture change |

## Human Decisions Needed

| Decision | Reason | Options | Recommended | Owner | Status |
|---|---|---|---|---|---|
| None | project evidence completed the bounded technical work | N/A | review staged candidate before commit/push | human | NOT_REQUIRED |

## Next Safe Action

Review the exact staged Task 248 candidate. Do not commit, push, or apply to Pawcode without a new instruction.

## Technical Details

Task: `tasks/248-verified-prior-apply-dirty-overlap.md`

Spec: `specs/248-verified-prior-apply-dirty-overlap.md`

Eval: `evals/248-verified-prior-apply-dirty-overlap.md`

Review Packet: `review-packets/248-verified-prior-apply-dirty-overlap.md`

Review Loop Report: `review-loop-reports/248-verified-prior-apply-dirty-overlap.md`

Commands run:

```text
node --check <four changed source/test files>
node --test --test-name-pattern='dirty generated project preserves business work' tests/project-entry-generated-parity.test.mjs
node --test tests/execution-distribution-trust.test.mjs
npm run verify:project-entry
node scripts/check-manifest.mjs
Node 22.22.3: node scripts/check-intentos.mjs
git diff --check
read-only Pawcode v3/v4 validation
```

Changed files:

- four source/test files and eleven Task 248 governance/evidence files

Evidence refs:

- Review Packet 248, Review Loop 248, Change Boundary 127, Pawcode v3 receipt, and stale v4 plan.

## Audit Notes

Approvals:

- None required.

Exceptions:

- Fresh Pawcode apply and checker-performance refactor are explicitly outside this task.

Residual risks:

- A fresh Pawcode plan/apply remains outside this task, stale v4 remains unusable, and the repeated checker graph/Node 23 shutdown behavior remains follow-up debt. No commit/push recommendation is implied.
