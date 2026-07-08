# IntentOS 1.83.3 Release Record

## Theme

Task Governance verification status and intent-scan hardening.

## Summary

1.83.3 hardens the 1.83 Task Governance line after review feedback.

It keeps Task Governance as a classifier, router, and review-policy gate. It
does not turn Task Governance into a full global enforcement layer, but it
removes several overclaim and boundary risks before future execution-chain
integration.

## Changed

- Replaced lightweight close-out verification "done" fields with status fields:
  - `minimal_verification_status`
  - `targeted_verification_status`
- Resolver defaults now use `REQUIRED` instead of claiming LOW or MEDIUM
  verification has already been performed.
- `--out` now rejects absolute paths and must stay inside the target project.
- Checker scans the original `intent` for hidden high-impact wording when a
  report claims `LOW` or `MEDIUM`.
- Valid `MATCHED` / `STRONGER` project-native mappings now clear matching
  readiness blockers for Business Rule Closure and Verification Plan.
- Added `plain_user_summary` so the user-facing message can stay in plain
  language while technical evidence remains available for reviewers.
- Added a bad fixture for hidden high-impact intent inside a LOW report.
- Updated docs, template, examples, fixture reports, manifest, README, version
  files, and self-check coverage.

## Allowed Claims

- Task Governance no longer claims classifier-time verification as already
  done.
- LOW and MEDIUM reports are checked against the original user intent for
  hidden high-impact wording.
- Task Governance report output paths are bounded to the target project.
- Project-native evidence mappings can reduce matching readiness blockers only
  when they are matched or stronger and current-task matched.
- User-facing summaries can remain plain-language while structured evidence
  remains machine-checkable.

## Forbidden Claims

- This release does not complete global Behavior-Complete Enforcement.
- This release does not approve implementation.
- This release does not approve completion, commit, push, release, production,
  CI changes, hooks, migrations, or native apply.
- This release does not replace project-native reviewers.
- This release does not prove the implementation, tests, business rule, or
  production behavior are correct.

## Evidence Status

- Resolver and checker syntax are covered by `verify:syntax`.
- Task Governance CLI smoke remains covered by `verify:governance`.
- Positive examples run through strict structured evidence checks.
- `check-intentos` covers the 1.83.3 release files, verification-status markers,
  hidden-intent bad fixture, and full Task Governance asset presence.

## Known Limitations

- Task Governance is still a classifier/router/review-policy gate, not a global
  execution-chain blocker.
- Verification status says what is required or recorded; it does not execute
  tests.
- Intent scanning is conservative and keyword-based. Future work may integrate
  richer project-aware risk detection.
- Project-native mapping clears only matching readiness blockers. Other missing
  evidence remains blocked.
- Plain user summaries reduce user burden but do not replace structured
  reviewer evidence.

## Verification

Required verification:

```bash
node --check scripts/resolve-task-governance.mjs
node --check scripts/check-task-governance.mjs
node scripts/check-task-governance.mjs examples/1.83-task-governance/low-copy-change --require-structured-evidence
node scripts/check-task-governance.mjs examples/1.83-task-governance/medium-list-filter --require-structured-evidence
node scripts/check-task-governance.mjs examples/1.83-task-governance/project-native-rfc-mapping --require-structured-evidence
node scripts/check-task-governance.mjs test-fixtures/bad/bad-task-governance-low-hidden-intent-api --require-structured-evidence
node scripts/resolve-task-governance.mjs . --out /tmp/task-governance.md
node scripts/check-intentos.mjs
git diff --check
```

The hidden-intent bad fixture and absolute `--out` command must fail.
