# 1.69.1 Release Record

## Release

`1.69.1`

## Theme

Existing Project Native Adoption Evidence Hardening.

## Summary

1.69.1 hardens the 1.69 old-project adoption path. It keeps IntentOS-native adoption as the preferred direction for existing projects, but makes the recommendation coverage-aware.

The main behavior change is:

- Existing Rule Reconciliation now records total extracted rules, reconciled rules, omitted rules, and truncation warnings.
- If extracted rules are omitted, selected native adoption is blocked until those rules are reviewed.
- Apply-plan readiness is split into "can recommend now" and "can recommend after human review".
- `doctor --dry-run` now reflects the old-project adoption diagnosis branch instead of showing a generic missing-asset path.

## What Changed

- Added rule reconciliation coverage to `scripts/resolve-existing-rule-reconciliation.mjs`.
- Tightened `scripts/check-existing-rule-reconciliation.mjs` strict structured evidence validation.
- Extended `schemas/artifacts/existing-rule-reconciliation.schema.json`.
- Updated Existing Rule Reconciliation core docs, user docs, template, and governed web-admin example.
- Added generated-project self-check coverage for truncated rule reconciliation.
- Added old-project-aware `doctor --dry-run` handling in `scripts/cli.mjs`.

## User Impact

For an existing governed project, Codex can still recommend an IntentOS-native path, but only when the rule comparison is complete enough to justify it.

If too many extracted rules are omitted from reconciliation, users should see:

```text
AI recommendation: BLOCKED_NEEDS_OWNER
Reason: some extracted project rules were not reconciled
Can recommend apply plan now: No
Can recommend after human review: Yes
```

This keeps the user decision simple while preventing the AI from hiding technical incompleteness.

## Safety Boundaries

1.69.1 does not:

- write target-project files;
- install `.intentos`;
- replace `AGENTS.md`;
- change CI, hooks, release SOPs, baselines, production config, secrets, migrations, payment, permissions, data, provider state, legal, tax, finance, HR, security, privacy, or compliance behavior;
- approve implementation;
- approve release or production.

## Allowed Claims

- 1.69.1 makes existing-project native adoption recommendations coverage-aware.
- Existing Rule Reconciliation can now report omitted extracted rules.
- Omitted extracted rules block selected native adoption until reviewed.
- `doctor --dry-run` now reflects old-project adoption diagnosis.
- The recommendation remains read-only and does not authorize target-project writes.

## Forbidden Claims

- Do not claim 1.69.1 automatically migrates existing projects.
- Do not claim 1.69.1 installs `.intentos` into old projects.
- Do not claim 1.69.1 replaces existing `AGENTS.md`, CI, hooks, release SOPs, baselines, or production controls.
- Do not claim omitted rules can be ignored.
- Do not claim an apply plan is approved because it may be recommended after review.
- Do not claim Codex can approve implementation, commit, release, production, secrets, migrations, payment, permissions, or provider changes.

## Verification

The release must be verified with:

- syntax checks for changed scripts;
- manifest validation;
- strict Existing Rule Reconciliation example validation;
- repository-level `reconcile-rules --auto-native` validation;
- governance verification;
- full `node scripts/check-intentos.mjs`;
- `git diff --check`.

## Evidence Status

- Version metadata points to `1.69.1`.
- CLI version prints `1.69.1`.
- Strict Existing Rule Reconciliation example validation passed.
- Truncated extracted-rule reconciliation is covered in intentos self-check.
- `doctor --dry-run` has project-aware old-project branch behavior.
- Source verification evidence is recorded in [self-check-report.md](self-check-report.md).
- GitHub Release publication is outside source verification.

## Checks Run

- `node --check scripts/cli.mjs`
- `node --check scripts/resolve-existing-rule-reconciliation.mjs`
- `node --check scripts/check-existing-rule-reconciliation.mjs`
- `node --check scripts/check-intentos.mjs`
- `node scripts/cli.mjs --version`
- `node scripts/check-manifest.mjs`
- `node scripts/check-existing-rule-reconciliation.mjs examples/1.66-existing-rule-reconciliation/governed-web-admin --require-structured-evidence`
- `node scripts/cli.mjs reconcile-rules . --auto-native`
- `node scripts/check-existing-rule-reconciliation.mjs .`
- `npm --silent run verify:governance`
- `node scripts/check-intentos.mjs`
- `git diff --check`

## Known Limitations

- The release is still source-only. There is no npm publication, hosted dashboard, installer, or automatic apply runner.
- Rule reconciliation currently reconciles a bounded set of extracted rules and blocks selected native adoption when rules are omitted.
- GitHub Release publication is outside source verification.
- See [known-limitations.md](known-limitations.md).
