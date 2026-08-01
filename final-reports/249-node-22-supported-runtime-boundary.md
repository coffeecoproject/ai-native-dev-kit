# Final Report: 249-node-22-supported-runtime-boundary

Use this file when a task result needs a durable final report beyond the chat response.

This report does not approve release, risk, scope expansion, or future work. Next-step suggestions must follow `core/next-step-boundary.md`.

## Human Decision Summary

Conclusion: The Node 22 support boundary is implemented, all current-task gates pass, and the final Node 22.22.3 full source self-check succeeds.

Recommended choice: A

Can AI continue now: Yes; perform the already-authorized commit, push, and safe default-branch fast-forward

What I need from you: Nothing now. Stop and report only if the remote branch ancestry changed.

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Close current task | Record result and stop | Report only | low | Choose when the task is complete |
| B | Run bounded verification | Run the listed checks and update evidence | Evidence/report only, unless fixes are separately approved | low/medium | Choose when proof is missing but scope is stable |
| C | Route human decision | Stop before risk, release, or scope changes | Decision/report only | medium/high | Choose when the remaining item needs ownership |
| D | Open a new request | Treat follow-up as separate work | New request/report only | low/medium | Choose when the next step is outside current scope |

Recommended reason: The evidence-only finding is closed, the cached diff is clean, and the single final Node 22.22.3 full source rerun returned `IntentOS self-check passed.`

What happens if you do nothing: The feature branch remains usable but unmerged, and the corrected Node support boundary is not available from the default branch.

## Human Summary

One-sentence conclusion: IntentOS now declares and checks the same Node 22.x boundary used by first-party CI, and the complete source self-check passes under Node 22.22.3.

## Completed

- Bounded `package.json` support to `>=22 <23`.
- Aligned English, Chinese, source-only, maintainer, and contributor guidance to Node 22.x.
- Updated the self-check to reject drift back to an open-ended engine range.
- Preserved existing Node 22 CI configuration and all Task 248 adoption/apply behavior.

## Verified

| Check | Command / Evidence | Result |
|---|---|---|
| modified JavaScript syntax | Node 22.22.3 `node --check scripts/self-check/foundation.mjs` | PASS |
| self-check modularity | Node 22.22.3 `node --test tests/check-intentos-modularity.test.mjs` | PASS 2/2 |
| manifest | Node 22.22.3 `node scripts/check-manifest.mjs` | PASS |
| current task artifacts | Node 22.22.3 current-task ready check | PASS 5 files |
| change boundary | Change Boundary 128 checker, rerun after its table correction | PASS |
| exact diff | `git diff --cached --check` | PASS after bounded evidence cleanup |
| full source self-check | Node 22.22.3 `node scripts/check-intentos.mjs` | PASS; `IntentOS self-check passed.` |

## Not Changed

- GitHub workflow files and their existing `node-version: 22` configuration.
- Source-only adoption, controlled apply, receipt, identity, target-project, dependency, release, and production behavior.
- Node 23 runtime internals or the checker DAG.

## Change Boundary

Change-boundary report: `change-boundary-reports/128-node-22-supported-runtime-boundary.md`

Unexpected files changed: No

Boundary disposition: PASS

## Baseline State

Baseline-state report: Not required

Baseline overclaim found: No

No-code or evidence-required baselines were treated as confirmed: No

## Risks Remaining

- Node 23 and newer majors remain outside the supported verification boundary; their shutdown behavior is separate work.
- Remote ancestry must be confirmed immediately before pushing the verified candidate and default branch.

## Current Mainline And Parking Lot

| Item | Placement | Status | Re-entry path |
|---|---|---|---|
| Task 249 | Current Mainline | Verified and ready for authorized Git closeout | current user authorization |
| Node 23 compatibility / checker shutdown | Parking Lot | Not part of the stable runtime boundary | new request |

## Assumption Register

Use this section only when the result depends on inferred or unconfirmed facts.

| Assumption | Evidence | Confidence | Can proceed? | Needs human confirmation? | Owner | Status |
|---|---|---|---|---|---|---|
| Node 22 is the current formal verification major | both first-party workflows use Node 22 and Task 248 full source self-check passed under Node 22.22.3 | high | Yes | No | AI | CONFIRMED |

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | IN_SCOPE_NEXT_STEP | Commit and push the verified feature branch | publishes the exact reviewed candidate as the current task's authorized Git closeout | Yes | current task | verify remote branch state; no force push |
| N2 | IN_SCOPE_NEXT_STEP | Fast-forward and push `main` after confirming remote ancestry | makes the verified candidate the default branch | Yes, after N1 | current task | stop if ancestry changed; no tag, release, or production action |
| N4 | OUT_OF_SCOPE_OBSERVATION | Node 23/checker shutdown still needs separate compatibility evidence | does not block Node 22 support | No | record as context | compatibility/performance scope |

## Human Decisions Needed

| Decision | Reason | Options | Recommended | Owner | Status |
|---|---|---|---|---|---|
| None | Project evidence proves the bounded runtime declaration; merge authority is already present in the current user request | N/A | perform only the verified Git closeout | human | NOT_REQUIRED |

## Next Safe Action

Commit and push the exact verified feature-branch candidate, confirm that the remote `main` remains an ancestor, then fast-forward and push `main`. Stop without rewriting history if the remote branch has moved.

## Technical Details

Task: `tasks/249-node-22-supported-runtime-boundary.md`

Spec: `specs/249-node-22-supported-runtime-boundary.md`

Eval: `evals/249-node-22-supported-runtime-boundary.md`

Review Packet: `review-packets/249-node-22-supported-runtime-boundary.md`

Review Loop Report: `review-loop-reports/249-node-22-supported-runtime-boundary.md`

Commands run:

```text
Node 22.22.3: node --check scripts/self-check/foundation.mjs
Node 22.22.3: node --test tests/check-intentos-modularity.test.mjs
Node 22.22.3: node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/249-node-22-supported-runtime-boundary.md
Node 22.22.3: node scripts/check-manifest.mjs
Node 22.22.3: node scripts/check-change-boundary.mjs . --report change-boundary-reports/128-node-22-supported-runtime-boundary.md
git diff --cached --check
Node 22.22.3: node scripts/check-intentos.mjs (`IntentOS self-check passed.`)
```

Changed files:

- seven runtime-contract/documentation/self-check files
- eleven Task 249 governance/evidence files

Evidence refs:

- Change Boundary 128
- Review Packet 249
- Review Loop 249
- Task 248 Node 22 full-check and external-project simulation evidence

## Audit Notes

Approvals:

- User authorized fixing the Node 22 boundary and merging the verified branch into the default branch.

Exceptions:

- The first full run was intentionally stopped at the first evidence-only failure; the finding was closed without source repair, and the final full rerun passed.

Residual risks:

- Node 23 compatibility and checker-DAG performance remain outside Task 249.
