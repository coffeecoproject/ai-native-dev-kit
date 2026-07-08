# IntentOS 1.83.3 Self-Check Report

## Scope

This self-check covers Task Governance verification status, intent scanning,
bounded report output, readiness blocker mapping, and user-burden hardening.

## Required Checks

- `node --check scripts/resolve-task-governance.mjs`
- `node --check scripts/check-task-governance.mjs`
- `node scripts/check-task-governance.mjs examples/1.83-task-governance/low-copy-change --require-structured-evidence`
- `node scripts/check-task-governance.mjs examples/1.83-task-governance/medium-list-filter --require-structured-evidence`
- `node scripts/check-task-governance.mjs examples/1.83-task-governance/project-native-rfc-mapping --require-structured-evidence`
- `node scripts/check-task-governance.mjs test-fixtures/bad/bad-task-governance-low-hidden-intent-api --require-structured-evidence`
- `node scripts/resolve-task-governance.mjs . --out /tmp/task-governance.md`
- `node scripts/check-intentos.mjs`
- `git diff --check`

## Expected Result

- Positive examples pass strict Task Governance checks.
- The hidden-intent LOW bad fixture fails.
- Absolute `--out` fails.
- Project-native mappings clear matching readiness blockers without approving
  implementation or completion.
- User-facing summaries remain plain-language.
