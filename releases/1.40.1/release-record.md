# Release Record: 1.40.1

## Summary

`1.40.1` is an Approval Record hardening release.

It does not add a new governance module. It stabilizes the current `1.40.x` line after review pointed out complexity, naming, lifecycle, lightweight-path, and approval-boundary gaps.

## Added / Changed

- Clarified naming:
  - `IntentOS` is the product and workflow-system name.
  - `AI Native Dev Kit` is the historical repository/package lineage.
  - `ai-native` remains a compatibility CLI/package alias.
- Clarified that `1.4.0` was the historical Project Memory phase and the current line is `1.40.x`.
- Added `docs/artifact-lifecycle.md`.
- Added `docs/o0-bl0-lightweight-path.md`.
- Added `docs/plans/approval-record-hardening-1.40.1-plan.md`.
- Strengthened Approval Record checks for wildcard target paths, parent directory traversal, symlink aliases, expired approvals, ambiguous human owners, mismatched action IDs, and explicit plan-changed-after-approval records.
- Added bad fixtures and fixture matrix coverage for the new rejection cases.
- Updated README, docs index, operator manual, references, templates, CLI help, manifest, workflow version, and release evidence.

## Allowed Claims

- IntentOS has a clearer user-entry and maintainer-evidence split.
- IntentOS now has an artifact lifecycle map and O0 / BL0 lightweight path.
- Approval Record checks reject broader path, owner, expiry, and action-ID ambiguity.
- `1.40.1` hardens the `1.40.x` approval evidence layer.

## Forbidden Claims

- Do not claim this release adds machine-readable apply schemas.
- Do not claim this release adds a controlled apply runner.
- Do not claim Approval Records can execute writes.
- Do not claim Approval Records authorize automatic apply.
- Do not claim Approval Records approve implementation, release, production, CI, hooks, migrations, secrets, payments, compliance, or industrial packs.
- Do not claim target-project writes are now safe without a separate apply plan, readiness report, exact human approval, and later controlled-apply mechanism.

## Verification

Expected verification:

```bash
node --check scripts/check-approval-record.mjs
node --check scripts/cli.mjs
node scripts/check-approval-record.mjs .
node scripts/check-approval-record.mjs examples/1.40-approval-record-governance
node scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
git diff --check
```

## Evidence Status

- Source evidence: included.
- Example evidence: included.
- Bad fixtures: included.
- Real-project evidence: not claimed by this patch.

## Known Limitations

- Approval Records are still Markdown-first evidence.
- Plan hash presence is checked, but digest recomputation is reserved for a later machine-readable schema phase.
- Human identity is still evidence-based, not cryptographically verified.
- Symlink handling is policy-level and text-level in this release; a future apply runner must still verify filesystem reality before writing.
- This release does not add controlled apply or automatic apply.

## Boundary

This release is a stabilization and hardening release only. It does not approve target-project writes, release, production, hooks, CI, schema migration, or controlled apply.
