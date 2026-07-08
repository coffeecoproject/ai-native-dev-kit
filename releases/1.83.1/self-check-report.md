# IntentOS 1.83.1 Self-Check Report

## Scope

This self-check covers Task Governance project-native evidence binding.

## Required Checks

- `node --check scripts/resolve-task-governance.mjs`
- `node --check scripts/check-task-governance.mjs`
- `node scripts/check-task-governance.mjs examples/1.83-task-governance/project-native-rfc-mapping --require-structured-evidence`
- `node scripts/check-task-governance.mjs examples/1.83-task-governance/project-native-qa-checklist-mapping --require-structured-evidence`
- `node scripts/check-task-governance.mjs test-fixtures/bad/bad-task-governance-project-native-digest-mismatch --require-structured-evidence`
- `node scripts/check-intentos.mjs`
- `npm run verify`
- `git diff --check`

## Expected Result

- Positive project-native examples pass strict Task Governance checks.
- The digest-mismatch bad fixture fails.
- Task Governance remains non-authorizing and does not write target-project
  files, install `.intentos/`, replace `AGENTS.md`, change CI/hooks, approve
  implementation, or claim completion.
