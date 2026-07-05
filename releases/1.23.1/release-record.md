# Release 1.23.1: Governance Verification and README Entry Patch

## Human Summary

1.23.1 is a small patch after Hook Orchestration Governance.

It makes local verification more explicit for the 1.20-1.23 governance layer and makes the README easier to use when the user only wants to know which command to run first.

## What Changed

- Added `npm run verify:governance`.
- `npm run verify` now includes `verify:governance` before release verification.
- `verify:governance` runs workflow-map, doc-lifecycle, work-queue, hook-plan, and their checkers.
- README and README.zh-CN now include a plain decision table for the first command to run.
- Version metadata is synchronized to `1.23.1`.

## Allowed Claims

- 1.23.1 improves local verification coverage for existing-project workflow mapping, document lifecycle, work queue, and hook orchestration.
- 1.23.1 improves the README entry experience for users choosing the first safe command.
- 1.23.1 keeps the 1.20-1.23 governance layer plan-first and read-only by default.

## Forbidden Claims

- Do not claim 1.23.1 adds a new workflow layer.
- Do not claim 1.23.1 archives, deletes, moves, or rewrites project documents.
- Do not claim 1.23.1 updates work queue state automatically.
- Do not claim 1.23.1 installs hooks, modifies CI, adds blocking gates, calls external APIs, enables auto-fix, or changes target-project files.
- Do not claim 1.23.1 approves implementation, release, production, security, compliance, privacy, payment, migration, or data decisions.

## Evidence Status

- Evidence is based on local repository verification and release checks.
- No target-project write behavior is added.
- No new required target-project asset is added.
- No hook, CI, archive, work queue apply, or external API automation is enabled.

## Known Limitations

- `verify:governance` is a local verification bundle; it does not prove production adoption.
- README command selection remains guidance, not project approval.
- Execution-layer apply plans remain future work.

## Verification

Required checks:

```bash
npm run verify:governance
npm run verify:syntax
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify:release
npm run verify
git diff --check
```

## Next

The next larger phase can introduce a conservative Governance Plan Apply Framework, but it must remain `resolve -> write-plan -> human review -> apply-plan`.
