# 1.69.0 Release Record

## Release

`1.69.0`

## Theme

Existing Project Native Adoption Decision.

## Summary

1.69.0 improves the old-project adoption path. It lets Codex work under IntentOS mode for existing projects while keeping target-project writes blocked until a reviewed plan exists.

The main behavior change is:

- `doctor` stops at old-project adoption diagnosis instead of running full missing-asset checks.
- `reconcile-rules --auto-native` can generate temporary read-only Native Migration input when no `native-migration-plans/` report has been written.
- Existing Rule Reconciliation now includes an IntentOS Adoption Recommendation so the AI recommends the technical migration path and the human confirms authority/risk acceptance.

## What Changed

- Added old-project aware `doctor` routing in `scripts/cli.mjs`.
- Added `--auto-native` to `scripts/resolve-existing-rule-reconciliation.mjs`.
- Added optional `native_adoption_decision` structured evidence for existing rule reconciliation.
- Added self-check coverage for governed existing-project `doctor` and `reconcile-rules --auto-native`.
- Updated existing-project docs to explain native adoption recommendation and continuous read-only reconciliation.

## User Impact

For an existing governed or production-sensitive project, users should see a clearer path:

```text
IntentOS is active for Codex work.
Project file migration is still blocked.
AI recommends the safest native adoption path.
Human confirms whether Codex may prepare a reviewable apply plan.
```

Users should not be asked to judge low-level technical details such as whether a CI guard, release SOP, hook, or engineering baseline is stricter. Codex should compare and recommend.

## Safety Boundaries

1.69.0 does not:

- write target-project files;
- install `.intentos`;
- replace `AGENTS.md`;
- change CI, hooks, release SOPs, production config, secrets, migrations, payment, permissions, data, provider state, legal, tax, finance, HR, security, privacy, or compliance behavior;
- approve implementation;
- approve release or production.

## Allowed Claims

- 1.69.0 improves old-project adoption diagnosis.
- `doctor` can stop at old-project adoption diagnosis instead of running full missing-asset checks.
- `reconcile-rules --auto-native` can generate temporary read-only Native Migration input for recommendation.
- Existing Rule Reconciliation can include an IntentOS Adoption Recommendation.
- The recommendation is read-only and does not authorize target-project writes.

## Forbidden Claims

- Do not claim 1.69.0 automatically migrates existing projects.
- Do not claim 1.69.0 installs `.intentos` into old projects.
- Do not claim 1.69.0 replaces existing `AGENTS.md`, CI, hooks, release SOPs, baselines, or production controls.
- Do not claim 1.69.0 lets Codex approve implementation, commit, release, production, secrets, migrations, payment, permissions, or provider changes.
- Do not claim `--auto-native` writes a Native Migration Plan to the target project.

## Verification

The release must be verified with:

- syntax checks for changed scripts;
- manifest validation;
- `doctor` governed-existing-project calibration;
- `reconcile-rules --auto-native` governed-existing-project calibration;
- full `node scripts/check-intentos.mjs`;
- `git diff --check`.

## Evidence Status

- Version metadata points to `1.69.0`.
- CLI help prints `1.69.0`.
- `doctor` governed existing-project calibration passed without full missing-asset noise.
- `reconcile-rules --auto-native` governed existing-project calibration passed with a read-only IntentOS Adoption Recommendation.
- Full intentos self-check passed.
- Source verification evidence is recorded in [self-check-report.md](self-check-report.md).
- GitHub Release publication is outside source verification.

## Checks Run

- `node --check scripts/cli.mjs`
- `node --check scripts/resolve-existing-rule-reconciliation.mjs`
- `node --check scripts/check-intentos.mjs`
- `node scripts/cli.mjs --version`
- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `git diff --check`

## Known Limitations

- The release is still source-only. There is no npm publication, hosted dashboard, installer, or automatic apply runner.
- The native adoption recommendation is conservative and may still block when project authority is unclear.
- GitHub Release publication is outside source verification.
- See [known-limitations.md](known-limitations.md).
