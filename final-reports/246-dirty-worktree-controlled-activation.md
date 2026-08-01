# Final Report: 246-dirty-worktree-controlled-activation

Use this file when a task result needs a durable final report beyond the chat response.

This report does not approve release, risk, scope expansion, or future work. Next-step suggestions must follow `core/next-step-boundary.md`.

## Human Decision Summary

Conclusion: Exact dirty-plan proof closes the controlled activation rollback gap.

Recommended choice: A

Can AI continue now: yes

What I need from you: Nothing.

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Close current task | Record result and stop | Report only | low | Choose when the task is complete |
| B | Run bounded verification | Run the listed checks and update evidence | Evidence/report only, unless fixes are separately approved | low/medium | Choose when proof is missing but scope is stable |
| C | Route human decision | Stop before risk, release, or scope changes | Decision/report only | medium/high | Choose when the remaining item needs ownership |
| D | Open a new request | Treat follow-up as separate work | New request/report only | low/medium | Choose when the next step is outside current scope |

Recommended reason: Focused, trust-suite, project-entry, real-target, and mandatory full source checks all pass.

What happens if you do nothing: safe dirty-project updates continue to roll back after writing and restoring governance assets.

## Human Summary

One-sentence conclusion: `REVIEW_DIRTY_WORKTREE` is accepted only when one exact controlled plan proves zero overlap.

Final report for dirty worktree controlled activation.

## Completed

- Added one strict dirty controlled-update activation predicate.
- Required a complete count-matching Git status fingerprint, safe executable paths, zero conflicts, and zero bidirectional overlap.
- Preserved all existing ready and pending-state behavior.
- Added positive and fail-closed regressions.

## Verified

| Check | Command / Evidence | Result |
|---|---|---|
| focused activation tests | 2 tests | PASS |
| execution/distribution suite | 72 tests | PASS |
| project-entry suite | 113 tests | PASS |
| real Pawcode v2 plan | activation eligible / 0 conflicts / 0 overlaps | PASS |
| full source self-check | `node scripts/check-intentos.mjs` | PASS, exit 0 |

## Not Changed

- Pawcode managed assets and business code.
- Workflow-next states, schemas, dependencies, CI/hooks, release, production, and external state.

## Change Boundary

Change-boundary report: `change-boundary-reports/125-dirty-worktree-controlled-activation.md`

Unexpected files changed: No

Boundary disposition: PASS

## Baseline State

Baseline-state report: Not required

Baseline overclaim found: No

No-code or evidence-required baselines were treated as confirmed: No

## Risks Remaining

- No known in-scope risk remains.

## Current Mainline And Parking Lot

| Item | Placement | Status | Re-entry path |
|---|---|---|---|
| Task 246 | Current Mainline | Complete | local commit |

## Assumption Register

Use this section only when the result depends on inferred or unconfirmed facts.

| Assumption | Evidence | Confidence | Can proceed? | Needs human confirmation? | Owner | Status |
|---|---|---|---|---|---|---|
| Pawcode v2 fingerprint is exact pre-apply evidence | plan digest and verified rollback receipt | high | Yes | No | AI | CONFIRMED |

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | IN_SCOPE_NEXT_STEP | create the local source commit | records the completed Task 246 change | Yes | current task | reversible local commit |

## Human Decisions Needed

| Decision | Reason | Options | Recommended | Owner | Status |
|---|---|---|---|---|---|
| None | project evidence is sufficient | N/A | continue | human | NOT_REQUIRED |

## Next Safe Action

Create the local Task 246 commit, then generate a fresh Pawcode controlled-apply plan.

## Technical Details

Task: `tasks/246-dirty-worktree-controlled-activation.md`

Spec: `specs/246-dirty-worktree-controlled-activation.md`

Eval: `evals/246-dirty-worktree-controlled-activation.md`

Review Packet: `review-packets/246-dirty-worktree-controlled-activation.md`

Review Loop Report: `review-loop-reports/246-dirty-worktree-controlled-activation.md`

Commands run:

```text
node --test --test-name-pattern='dirty-worktree activation|deferred agent authority' tests/execution-distribution-trust.test.mjs
node --test tests/execution-distribution-trust.test.mjs
npm run verify:project-entry
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
git diff --check
```

Changed files:

- activation predicate, existing trust tests, and Task 246 evidence

Evidence refs:

- Review packet, review loop, failed Pawcode receipt, and change-boundary report.

## Audit Notes

Approvals:

- None required.

Exceptions:

- Source-only generic baseline enforcement is handled by project-entry and full self-check gates.

Residual risks:

- None within Task 246 scope.
