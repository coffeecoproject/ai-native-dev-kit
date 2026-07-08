# IntentOS 1.83.1 Release Record

## Theme

Project-native evidence binding for Task Governance.

## Summary

1.83.1 hardens the 1.83 Task Governance line so existing projects can keep
their own RFCs, QA checklists, sessions, engineering baselines, release SOPs,
and gate records without turning those references into unverifiable claims.

The release keeps Task Governance non-authorizing. It does not write target
project files, install `.intentos/`, replace `AGENTS.md`, change CI/hooks,
authorize implementation, approve commit/push, approve release/production, or
claim task completion.

## Changed

- Expanded `task_governance` structured evidence to schema `1.83.1`.
- Added project-native binding fields to `existing_project_mapping`:
  - `project_native_evidence_digest`
  - `project_native_evidence_owner`
  - `project_native_evidence_scope`
  - `project_native_task_match`
  - `project_native_evidence_summary`
- Updated resolver output so generated Task Governance reports use the 1.83.1
  schema shape.
- Updated checker logic so `MATCHED` and `STRONGER` project-native mappings
  must resolve to an `artifact:` file, match its sha256 digest, record an
  owner, record concrete scope, and match the current task.
- Added explicit handling for `MISSING`, `WEAKER`, and `NEEDS_OWNER` project
  mappings.
- Added a bad fixture for project-native evidence digest mismatch.
- Updated Task Governance docs, prompt, checklist, template, examples, manifest,
  README, version files, and self-check coverage.

## Allowed Claims

- Existing project-native evidence can satisfy an IntentOS task-governance
  requirement only when it is resolvable, digest-matched, owned, scoped,
  current-task matched, and summarized.
- Stronger project-native rules can be preserved and mapped without being
  downgraded into weaker IntentOS wording.
- Missing project-native evidence is explicitly represented as `MISSING` with
  `N/A` binding fields and a reason.

## Forbidden Claims

- This release does not make Task Governance an implementation approval.
- This release does not make project-native evidence a completion claim by
  itself.
- This release does not install or migrate target project assets.
- This release does not approve native apply, CI changes, hooks, release,
  production, migrations, tests, commit, or push.
- This release does not claim full IntentOS adoption.

## Evidence Status

- Resolver and checker syntax are covered by `verify:syntax`.
- Task Governance CLI smoke remains covered by `verify:governance`.
- Positive examples continue to run through strict structured evidence checks.
- `check-intentos` covers the 1.83.1 release files, project-native binding
  markers, the new digest-mismatch bad fixture, and full task-governance asset
  presence.

## Known Limitations

- Project-native evidence binding proves that a referenced project artifact is
  resolvable, digest-matched, owned, scoped, and matched to the current task; it
  does not prove the business rule is correct.
- A matching digest proves artifact identity only. It does not prove approval,
  runtime behavior, test quality, release readiness, or production safety.
- Owner and scope metadata do not replace owner approval, controlled apply
  readiness, rollback evidence, or project release authority.
- Task Governance remains non-authorizing. It cannot approve implementation,
  native apply, CI changes, hooks, release, production, commit, push, or full
  IntentOS adoption.
- Projects with weak, stale, missing, or owner-unknown native records still need
  governance repair before those records can be treated as stronger project
  rules.

## Verification

Required verification:

```bash
node --check scripts/resolve-task-governance.mjs
node --check scripts/check-task-governance.mjs
node scripts/check-task-governance.mjs examples/1.83-task-governance/project-native-rfc-mapping --require-structured-evidence
node scripts/check-task-governance.mjs examples/1.83-task-governance/project-native-qa-checklist-mapping --require-structured-evidence
node scripts/check-task-governance.mjs test-fixtures/bad/bad-task-governance-project-native-digest-mismatch --require-structured-evidence
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

The digest-mismatch fixture must fail.
