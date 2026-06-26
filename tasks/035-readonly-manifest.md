# Task: Read-only Dev Kit Manifest

## Task Level

L2

## Related Spec

Spec: `specs/035-readonly-manifest.md`

## Related Eval

Eval: `evals/035-readonly-manifest.md`

## Goal

Execute Productization Hardcut phase `0.35.0` by adding a read-only dev-kit manifest, schema, loader, drift checker, and self-check coverage.

## Scope

Allowed:

- Add `dev-kit-manifest.json`.
- Add `schemas/dev-kit-manifest.schema.json`.
- Add `scripts/lib/manifest.mjs`.
- Add `scripts/check-manifest.mjs`.
- Add `0.35.0` workflow artifacts and release evidence.
- Update `scripts/check-dev-kit.mjs` to check manifest behavior.
- Update dev-kit CI workflows to run `node scripts/check-manifest.mjs`.
- Update version metadata to `0.35.0`.

Not allowed:

- Implement CLI.
- Make manifest authoritative.
- Change init/update/check behavior to consume manifest.
- Add artifact frontmatter or workflow artifact schema enforcement.
- Change target-project bootstrap semantics.
- Promote industrial pack maturity.
- Rewrite license terms.

## Acceptance Criteria

- `node scripts/check-manifest.mjs` passes.
- `node scripts/check-dev-kit.mjs` passes and includes manifest checks.
- Manifest invalid structure fails before drift checking.
- Manifest sourceRequired drift is reported clearly.
- CI includes manifest check steps.
- Final report records verification results.

## Commands

```bash
git diff --check
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/check-manifest.mjs
node scripts/check-goal-mode.mjs . --goal-card goal-cards/035-readonly-manifest.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/035-readonly-manifest.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/035-readonly-manifest.md
node scripts/check-review-loop.mjs . --task tasks/035-readonly-manifest.md
node scripts/check-next-step-boundary.mjs . --task tasks/035-readonly-manifest.md
node scripts/score-output-quality.mjs . --min-score 80
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
```

## AI Budget

Max agent runs: 6

Max repair runs: 2

Stop if: Work drifts into CLI, authoritative manifest behavior, artifact schema enforcement, or init/update behavior changes.

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

- Stop if existing scripts must consume manifest to pass.
- Stop if manifest checker produces noisy drift reports from unchanged lists.
- Stop if invalid manifest shape reaches drift checking.
- Stop if CI requires secrets.

## Final Report Required

Yes. Final report: `final-reports/035-readonly-manifest.md`
