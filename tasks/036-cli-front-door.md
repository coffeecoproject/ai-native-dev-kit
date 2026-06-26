# Task: CLI Front Door

## Task Level

L2

## Related Spec

Spec: `specs/036-cli-front-door.md`

## Related Eval

Eval: `evals/036-cli-front-door.md`

## Goal

Execute Productization Hardcut phase `0.36.0` by adding a thin `ai-native` CLI front door, package metadata, README guidance, self-check coverage, and phase evidence.

## Scope

Allowed:

- Add `package.json`.
- Add `scripts/cli.mjs`.
- Add help, version, dry-run, command routing, write-command display, and planned-only `migrate`.
- Update README and README.zh-CN CLI usage guidance.
- Update `scripts/check-dev-kit.mjs` with CLI smoke checks.
- Update version metadata to `0.36.0`.
- Add `0.36.0` workflow artifacts and release evidence.

Not allowed:

- Do not publish package.
- Do not add dependencies.
- Do not make manifest authoritative.
- Do not implement migration behavior.
- Do not add init/update safety plan or backup behavior.
- Do not add artifact frontmatter or schema enforcement.
- Do not change generated-project workflow semantics.
- Do not rewrite license terms.

## Acceptance Criteria

- CLI help, version, next, fixtures, self-check dry-run, update dry-run, doctor dry-run, and init smoke pass.
- `node scripts/check-dev-kit.mjs` passes and includes CLI checks.
- CLI write commands print underlying commands.
- `migrate` is planned-only.
- README explains CLI as the recommended human entry point.
- Final report records verification results.

## Commands

```bash
git diff --check
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/cli.mjs --help
node scripts/cli.mjs --version
node scripts/cli.mjs next .
node scripts/cli.mjs fixtures
node scripts/cli.mjs self-check --dry-run
node scripts/cli.mjs update --target /tmp/ai-native-cli-dry-run --dry-run
node scripts/cli.mjs doctor . --dry-run
node scripts/cli.mjs init --starter generic-project --target /tmp/ai-native-cli-test
node /tmp/ai-native-cli-test/scripts/check-ai-workflow.mjs /tmp/ai-native-cli-test --mode core
node scripts/check-manifest.mjs
node scripts/check-goal-mode.mjs . --goal-card goal-cards/036-cli-front-door.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/036-cli-front-door.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/036-cli-front-door.md
node scripts/check-review-loop.mjs . --task tasks/036-cli-front-door.md
node scripts/check-next-step-boundary.mjs . --task tasks/036-cli-front-door.md
node scripts/score-output-quality.mjs . --min-score 80
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
```

## AI Budget

Max agent runs: 6

Max repair runs: 2

Stop if: Work drifts into package publishing, manifest authority, migration implementation, init/update safety, or artifact schema enforcement.

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

- Stop if CLI must duplicate checker logic to pass.
- Stop if CLI hides lower-level command failure output.
- Stop if write commands cannot display underlying commands.
- Stop if self-check requires recursive CLI execution.

## Final Report Required

Yes. Final report: `final-reports/036-cli-front-door.md`
