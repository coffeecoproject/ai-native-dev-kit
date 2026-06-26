# Decision Brief: Fixture Matrix Boundary

## Human Summary

The decision for `0.40.0` is to expand fixture coverage without refactoring checker internals.

## Current Status

- Decision: fixture matrix expansion is in scope.
- Deferred: checker library refactor.
- Risk level: medium, because fixture runner behavior changes.

## What I Need From You

No additional decision is needed to close `0.40.0`. A future decision is needed before starting `0.40.1`.

## Recommended Next Step

Finish verification, commit `0.40.0`, then review whether to start the checker library refactor phase.

## What AI Can Do Safely

- Add and reorganize fixtures.
- Add runner setup/reporting plumbing.
- Update manifest/source inventory and version metadata.
- Run local checks.

## What AI Must Not Do

- Do not refactor checker internals in this phase.
- Do not change checker semantics to satisfy fixture cases.
- Do not commit generated project snapshots.
- Do not add dependencies.

## Human Decisions Needed

| Decision | Status | Owner | Route |
|---|---|---|---|
| Start `0.40.1` checker library refactor | Deferred | Repository owner | Future task |

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | DIRECT_FOLLOW_UP | Prepare `0.40.1` after `0.40.0` is reviewed | next roadmap phase | No | new request or task card | human approval required |
| N2 | DO_NOT_PROCEED | Do not start checker refactor in this commit | outside scope | No | do not proceed | separate approval required |

## Technical Details

The fixture runner may create temporary generated projects for cases that need target-project assets. It cleans up the temp directory after each case.

## Audit Notes

- This brief records scope boundary, not release approval.
- No external GPT/API review automation was added.
