# Final Report: Fixture Matrix Expansion

## Human Summary

Phase `0.40.0` makes fixture coverage explicit and easier to diagnose before checker refactoring.

## Completed

- Reorganized `test-fixtures/` into typed fixture areas.
- Moved existing bad fixtures under `test-fixtures/bad/`.
- Expanded `fixture-cases.json` with case type, checker, expected output, and repair guidance.
- Added generated-project and manifest-mismatch setup support to `check-fixtures.mjs`.
- Added migration coverage for legacy artifact frontmatter, workflow version mismatch, manifest mismatch, and BL2 skip behavior.
- Added CLI/init-update/workflow-next fixture smoke cases.
- Updated version metadata, manifest inventory, and phase evidence.

## Verified

Commands run:

```bash
node --check scripts/check-fixtures.mjs
node scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
git diff --check
find scripts -name '*.mjs' -exec node --check {} \;
node scripts/check-goal-mode.mjs . --goal-card goal-cards/040-fixture-matrix-expansion.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/040-fixture-matrix-expansion.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/040-fixture-matrix-expansion.md
node scripts/check-review-loop.mjs . --task tasks/040-fixture-matrix-expansion.md
node scripts/check-next-step-boundary.mjs . --task tasks/040-fixture-matrix-expansion.md
node scripts/score-output-quality.mjs . --min-score 80
node scripts/check-intentos.mjs
```

Result: PASS.

## Not Changed

- No checker library refactor.
- No production checker semantic change.
- No generated project snapshot committed.
- No dependency added.
- No migration command implemented.

## Risks Remaining

Fixture runtime is higher because generated-project setup is now used in selected cases. This is acceptable for intentos self-check but should be watched before adding many more generated-project cases.

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | DIRECT_FOLLOW_UP | Start `0.40.1` checker library refactor after `0.40.0` is reviewed | next roadmap phase | No | new request or task card | human approval required |
| N2 | DO_NOT_PROCEED | Do not refactor checker libraries as part of this commit | outside current task | No | do not proceed | separate approval required |

## Human Decisions Needed

| Decision | Status | Owner | Route |
|---|---|---|---|
| Start `0.40.1` checker refactor | Deferred | Repository owner | Future phase task |

## Next Safe Action

Review and commit `0.40.0`; then decide whether to begin `0.40.1`.

## Technical Details

The fixture runner creates temporary directories for setup-driven cases and removes them after each case. It does not call external services or write outside the temporary path.

## Audit Notes

- Task level: L2.
- Review loop final status: DONE.
- No external GPT/API review was used.
- No helper role remains open after handoff.
