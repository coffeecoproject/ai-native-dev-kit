# 1.20.0 Self-Check Report

## Scope

1.20.0 validates Existing Project Workflow Adapter.

## Validated Checks

| Check | Result |
|---|---|
| `node scripts/resolve-existing-workflow.mjs .` | PASS |
| `node scripts/resolve-existing-workflow.mjs . --json` | PASS |
| `node scripts/check-workflow-adoption-map.mjs .` | PASS |
| `node scripts/check-workflow-adoption-map.mjs examples/1.20-existing-project-workflow-adapter` | PASS |
| `node scripts/check-workflow-adoption-map.mjs test-fixtures/bad/bad-workflow-adoption-authorizes-write` | EXPECTED_FAIL |
| `node scripts/check-workflow-adoption-map.mjs test-fixtures/bad/bad-workflow-adoption-missing-use` | EXPECTED_FAIL |
| `npm run verify:syntax` | PASS |
| `npm run verify:release` | PASS |
| `npm run verify` | PASS |
| `git diff --check` | PASS |

## Boundary Confirmation

- Workflow maps are read-only recommendations.
- This release does not install target-project workflow assets.
- This release does not change hooks, CI, PR templates, release flow, or agent
  rules in target projects.
- This release does not approve implementation, production, release, migration,
  security, privacy, compliance, payment, finance, tax, HR, permission, or data
  decisions.
- Doc lifecycle, work queue, and hook orchestration remain later phases.
