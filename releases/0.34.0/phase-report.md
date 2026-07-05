# Phase Report: 0.34.0 Baseline Freeze And Self CI

## Human Summary

Phase `0.34.0` adds first-party intentos CI, repository governance files, baseline freeze evidence, and self-check coverage for those assets. The phase keeps later productization work out of scope.

## Scope Closed

- PR CI workflow added.
- Release CI workflow added.
- PR template added.
- CODEOWNERS draft guidance added.
- CONTRIBUTING and SECURITY files added.
- `0.33.0` baseline evidence added.
- Version metadata moved to `0.34.0`.
- `check-intentos` extended to validate first-party CI and governance files.

## Verification

Commands run:

```bash
git diff --check
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/check-goal-mode.mjs . --goal-card goal-cards/034-baseline-freeze-self-ci.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/034-baseline-freeze-self-ci.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/034-baseline-freeze-self-ci.md
node scripts/check-review-loop.mjs . --task tasks/034-baseline-freeze-self-ci.md
node scripts/check-next-step-boundary.mjs . --task tasks/034-baseline-freeze-self-ci.md
node scripts/score-output-quality.mjs . --min-score 80
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
```

Generated-project smoke:

```bash
tmp="$(mktemp -d)"
node scripts/init-project.mjs --starter generic-project --target "$tmp/project"
node "$tmp/project/scripts/check-ai-workflow.mjs" "$tmp/project" --mode core
node "$tmp/project/scripts/workflow-next.mjs" "$tmp/project"
node "$tmp/project/scripts/check-project-onboarding.mjs" "$tmp/project"
node "$tmp/project/scripts/check-engineering-baseline.mjs" "$tmp/project"
node "$tmp/project/scripts/check-workflow-version.mjs" "$tmp/project"
```

Result: PASS.

## Risk And Boundary

- No secrets are required by CI.
- No target-project bootstrap semantics were changed.
- No manifest, CLI, schema, or init/update safety implementation was added.
- No license wording was changed.

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | DIRECT_FOLLOW_UP | Start phase `0.35.0` read-only manifest introduction after review | It is the next phase, but not part of `0.34.0` | No | follow-up proposal or new request | Human approval required |
| N2 | OUT_OF_SCOPE_OBSERVATION | Generated-project smoke is not real adoption proof | This helps interpret phase evidence correctly | No | record as context | No implementation approval |

## Audit Notes

- This phase is repository productization work.
- Deferred release governance decisions remain outside this task.
- Final command results should be copied here before tagging a release.
