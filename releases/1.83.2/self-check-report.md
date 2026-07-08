# IntentOS 1.83.2 Self-Check Report

## Scope

This self-check covers Task Governance tier-specific review policy.

## Required Checks

- `node --check scripts/resolve-task-governance.mjs`
- `node --check scripts/check-task-governance.mjs`
- `node scripts/check-task-governance.mjs examples/1.83-task-governance/low-copy-change --require-structured-evidence`
- `node scripts/check-task-governance.mjs examples/1.83-task-governance/medium-list-filter --require-structured-evidence`
- `node scripts/check-task-governance.mjs examples/1.83-task-governance/review-required-step-policy --require-structured-evidence`
- `node scripts/check-task-governance.mjs test-fixtures/bad/bad-task-governance-low-wrong-review-policy --require-structured-evidence`
- `node scripts/check-intentos.mjs`
- `git diff --check`

## Expected Result

- Positive examples pass strict Task Governance checks.
- The low-review-policy bad fixture fails.
- Task Governance remains non-authorizing and does not write target-project
  files, install `.intentos/`, replace `AGENTS.md`, approve implementation,
  approve completion, approve commit/push, approve release/production, or
  replace project-native reviewers.
