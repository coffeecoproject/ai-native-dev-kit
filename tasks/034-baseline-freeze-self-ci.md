# Task: Baseline Freeze And Self CI

## Task Level

L2

## Related Spec

Spec: `specs/034-baseline-freeze-self-ci.md`

## Related Eval

Eval: `evals/034-baseline-freeze-self-ci.md`

## Goal

Execute Productization Hardcut Phase 0.34.0 by freezing the current `0.33.0` baseline and adding first-party dev-kit CI and repository governance files.

## Scope

Allowed:

- Add repository CI workflows under `.github/workflows/`.
- Add repository PR template, CODEOWNERS draft guidance, CONTRIBUTING, and SECURITY docs.
- Add baseline and phase evidence under `releases/`.
- Add task-scoped workflow artifacts for this phase.
- Update version metadata to `0.34.0`.
- Extend dev-kit self-check coverage for the new productization CI assets.

Not allowed:

- Implement CLI.
- Implement manifest.
- Implement schema/frontmatter.
- Implement init/update dry-run, plan, apply-plan, or backup.
- Change target-project bootstrap semantics.
- Promote any industrial pack maturity state.
- Rewrite license terms.

## Acceptance Criteria

- Productization Phase 0.34 assets exist.
- Dev-kit self-check validates the new CI and governance files.
- Baseline freeze records current `0.33.0` commit.
- Recursive script syntax check is part of CI.
- Generated-project smoke is part of CI.
- Final report records verification results.

## Commands

```bash
git diff --check
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
node scripts/check-goal-mode.mjs . --goal-card goal-cards/034-baseline-freeze-self-ci.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/034-baseline-freeze-self-ci.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/034-baseline-freeze-self-ci.md
node scripts/check-review-loop.mjs . --task tasks/034-baseline-freeze-self-ci.md
node scripts/check-next-step-boundary.mjs . --task tasks/034-baseline-freeze-self-ci.md
node scripts/score-output-quality.mjs . --min-score 80
```

## AI Budget

Max agent runs: 6

Max repair runs: 2

Stop if: CI scope expands into CLI, manifest, schema, or init/update implementation.

## Risk Gate

- [ ] auth
- [ ] permission
- [ ] secrets
- [ ] production-config
- [ ] migration
- [ ] destructive-operation
- [ ] value-transfer
- [ ] dependency-addition

## Human Approval

Required: No

Status: Not Required

Approval scope: Not Required

Approved by:

Approved at:

## Stop Conditions

- Stop if any new CI command requires secrets.
- Stop if generated-project smoke fails.
- Stop if `check-dev-kit` fails after adding CI files.
- Stop if work drifts into 0.35 or later phases.

## Final Report Required

Yes. Final report: `final-reports/034-baseline-freeze-self-ci.md`
