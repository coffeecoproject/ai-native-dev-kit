# Release 1.41.1: Structured Evidence Hardening

## Summary

1.41.1 hardens the 1.41 structured evidence chain without changing the default compatibility model.

It adds optional strict structured evidence checks for:

- Unified Apply Plan
- Controlled Apply Readiness
- Approval Record

## What Changed

- Fixed stale 1.41.0 release evidence status.
- Added `--require-structured-evidence` to apply/readiness/approval checkers.
- Strict mode now rejects artifacts that omit `Machine-Readable Evidence`.
- Strict readiness and approval checks require the referenced apply plan to resolve locally before claiming digest linkage.
- Structured readiness evidence rejects empty `actions` unless `readiness_state` is `NO_APPLY_PLAN`.
- Added strict-mode and empty-action bad fixtures.
- Clarified that schemas alone are not the complete safety boundary; the IntentOS checkers must run.

## Boundary

- Default checker behavior remains compatible with historical Markdown artifacts.
- No controlled apply runner is added.
- No target files are written by the new checks.
- No automatic apply authority is granted.
- No implementation, release, production, hook, CI, secret, migration, or BL2 approval is granted.
- No full JSON Schema engine is introduced.

## Allowed Claims

- This release adds optional strict structured evidence mode.
- Strict mode can require `Machine-Readable Evidence`.
- Strict readiness and approval checks require local plan reference resolution before digest cross-check claims.
- Structured readiness evidence must include actions unless the state is `NO_APPLY_PLAN`.
- This release improves evidence integrity for the write-control chain.

## Forbidden Claims

- Do not claim that 1.41.1 can execute apply plans.
- Do not claim that strict mode grants Codex authority to write files.
- Do not claim that schema files alone are the complete safety boundary.
- Do not claim that Approval Record validates real human identity.
- Do not claim that Markdown compatibility fallback is removed.
- Do not claim that this release approves implementation, release, production, hooks, CI, secrets, migrations, payments, security, privacy, legal, BL2, or industrial packs.

## Evidence Status

| Evidence | Status |
|---|---|
| `--require-structured-evidence` checker support | Local repository evidence |
| Strict structured example checks | Local repository evidence |
| Strict missing evidence fixtures | Local repository evidence |
| Strict missing local plan reference fixtures | Local repository evidence |
| Structured readiness empty action fixture | Local repository evidence |
| Full verification | See `releases/1.41.1/self-check-report.md` |

## Known Limitations

- Strict mode is opt-in.
- Historical Markdown artifacts still pass default semantic checks.
- Real human identity is still not cryptographically validated.
- Schema validation remains intentionally lightweight and local to this repository.
- Structured evidence improves evidence integrity, but it is not an execution engine.

## Verification

- `node scripts/check-apply-plan.mjs examples/1.41-structured-evidence-schema --require-structured-evidence`
- `node scripts/check-controlled-apply-readiness.mjs examples/1.41-structured-evidence-schema --require-structured-evidence`
- `node scripts/check-approval-record.mjs examples/1.41-structured-evidence-schema --require-structured-evidence`
- `node scripts/check-fixtures.mjs`
- `node scripts/check-intentos.mjs`
- `npm run verify:governance`
- `npm run verify:syntax`
- `git diff --check`
