# 1.67.0 Self-Check Report

## Scope

Release Core Model, Release Plan resolver/checker, examples, bad fixtures, and existing-project operating-mode semantics.

## Checks

- `node --check scripts/resolve-release-plan.mjs`
- `node --check scripts/check-release-plan.mjs`
- `node scripts/check-manifest.mjs`
- `node scripts/cli.mjs release-plan . --intent "help me launch"`
- `node scripts/cli.mjs release-check .`
- `node scripts/check-release-plan.mjs .`
- `node scripts/check-release-plan.mjs examples/1.67-release-core-model/web-preview --require-structured-evidence`
- `node scripts/check-release-plan.mjs examples/1.67-release-core-model/governed-existing-project-readonly --require-structured-evidence`
- bad fixture rejection checks
- `node scripts/check-fixtures.mjs --case "good workflow-next generated project"`
- `npm run verify:syntax`
- `npm run verify:governance`
- `npm run verify:examples`
- `npm run verify:release`
- `node scripts/check-dev-kit.mjs`
- `git diff --check`

## Result

Pass.

## Governance Review Notes

- `Release Plan` is implemented as a computed read-only projection, not a source of truth or execution authority.
- `Release Plan Trace` explains source-system inputs and does not drive lower-level adapter, recipe, handoff, or execution behavior.
- `IntentOS Operating Mode` may be active for an existing project, but it does not grant write permission.
- Existing-project release plans must include existing-rule comparison instead of ignoring existing baselines, release SOPs, hooks, CI, or governance assets.
- `workflow-next` was calibrated so generated IntentOS workflow assets such as `release-plans/`, `scripts/check-release-plan.mjs`, and `scripts/resolve-release-plan.mjs` do not falsely classify a new generated project as a production-governed project.

## Fixture Coverage

- Good examples:
  - `examples/1.67-release-core-model/web-preview`
  - `examples/1.67-release-core-model/governed-existing-project-readonly`
- Rejected bad examples:
  - `test-fixtures/bad/bad-release-plan-approves-production`
  - `test-fixtures/bad/bad-release-plan-missing-trace`
  - `test-fixtures/bad/bad-release-plan-state-drives-execution`
  - `test-fixtures/bad/bad-release-plan-operating-mode-writes-files`
  - `test-fixtures/bad/bad-release-plan-ignores-existing-rules`
