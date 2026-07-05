# Task: Init/Update Safety

## Task Level

L2

## Related Spec

Spec: `specs/038-init-update-safety.md`

## Related Eval

Eval: `evals/038-init-update-safety.md`

## Goal

Execute Productization Hardcut phase `0.38.0` by adding dry-run, write-plan, apply-plan, backup, and plan-first safety to init/update behavior.

## Scope

Allowed:

- Update `scripts/init-project.mjs` for plan generation, validation, application, backup, and guarded direct update.
- Update `scripts/cli.mjs` so global dry-run and command-level init/update dry-run have distinct behavior.
- Update `scripts/check-intentos.mjs` with safety smoke tests.
- Update version metadata, manifest, roadmap status, and phase evidence.
- Keep existing generated-project direct update behavior when the target is already bootstrapped and low-risk.

Not allowed:

- Do not implement migration command.
- Do not add dependencies.
- Do not add artifact schema/frontmatter enforcement.
- Do not change PR template or AGENTS governance approval semantics.
- Do not change industrial pack selection semantics.
- Do not publish package.
- Do not rewrite license terms.

## Acceptance Criteria

- `--dry-run` emits a plan and writes no target files.
- `--write-plan` writes only the plan.
- `--apply-plan` validates plan preconditions and applies the approved plan.
- Stale plans fail before writing.
- `--backup-dir` backs up overwritten managed files.
- Direct update is blocked for dirty or unbootstrapped existing projects.
- Dev-kit self-check passes.

## Commands

```bash
node --check scripts/init-project.mjs
node --check scripts/cli.mjs
node scripts/check-manifest.mjs
git diff --check
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/check-goal-mode.mjs . --goal-card goal-cards/038-init-update-safety.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/038-init-update-safety.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/038-init-update-safety.md
node scripts/check-review-loop.mjs . --task tasks/038-init-update-safety.md
node scripts/check-next-step-boundary.mjs . --task tasks/038-init-update-safety.md
node scripts/score-output-quality.mjs . --min-score 80
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
```

## AI Budget

Max agent runs: 6

Max repair runs: 2

Stop if: Work drifts into migration command, package publishing, schema/frontmatter, external reviewer automation, or project source-code scanning.

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

- Stop if direct update can still silently modify dirty or unbootstrapped existing projects.
- Stop if apply-plan can run after target files changed.
- Stop if backup-dir fails to preserve overwritten managed files.
- Stop if CLI dry-run semantics become ambiguous.

## Final Report Required

Yes. Final report: `final-reports/038-init-update-safety.md`
