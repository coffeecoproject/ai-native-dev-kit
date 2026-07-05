# Task: Artifact Frontmatter + Schema

## Task Level

L2

## Related Spec

Spec: `specs/039-artifact-frontmatter-schema.md`

## Related Eval

Eval: `evals/039-artifact-frontmatter-schema.md`

## Goal

Execute Productization Hardcut phase `0.39.0` by adding schema-backed frontmatter to new workflow artifacts while keeping old artifacts warning-compatible.

## Scope

Allowed:

- Add artifact schemas.
- Add dependency-free frontmatter helper.
- Update `new-workflow-item.mjs`.
- Update `check-workflow-artifacts.mjs`.
- Update generated-project asset manifests and version records.
- Add self-check coverage for generated, invalid, and legacy frontmatter.
- Add phase evidence and version metadata.

Not allowed:

- Do not migrate all existing examples.
- Do not make strict schema default.
- Do not add dependencies.
- Do not refactor checker internals beyond what frontmatter requires.
- Do not implement fixture matrix expansion.

## Acceptance Criteria

- New artifacts include valid frontmatter.
- Missing required frontmatter field fails.
- Legacy artifacts without frontmatter warn by default.
- `--strict-schema` fails legacy artifacts without frontmatter.
- Generated projects receive schemas and `scripts/lib/frontmatter.mjs`.
- Dev-kit self-check passes.

## Commands

```bash
node --check scripts/lib/frontmatter.mjs
node --check scripts/new-workflow-item.mjs
node --check scripts/check-workflow-artifacts.mjs
node scripts/check-manifest.mjs
git diff --check
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/check-goal-mode.mjs . --goal-card goal-cards/039-artifact-frontmatter-schema.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/039-artifact-frontmatter-schema.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/039-artifact-frontmatter-schema.md
node scripts/check-review-loop.mjs . --task tasks/039-artifact-frontmatter-schema.md
node scripts/check-next-step-boundary.mjs . --task tasks/039-artifact-frontmatter-schema.md
node scripts/score-output-quality.mjs . --min-score 80
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
```

## AI Budget

Max agent runs: 6

Max repair runs: 2

Stop if: Work drifts into full example migration, fixture matrix expansion, dependency addition, or strict schema as default.

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

- Stop if old artifacts fail by default in `0.39.x`.
- Stop if invalid frontmatter passes.
- Stop if Markdown section checks are weakened.
- Stop if a dependency is required.

## Final Report Required

Yes. Final report: `final-reports/039-artifact-frontmatter-schema.md`
