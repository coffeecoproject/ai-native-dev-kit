# Release 1.17.1: Guided Baseline Selection Calibration

## Human Summary

1.17.1 is a calibration patch for the 1.17 Guided Baseline Selection Entry.

It does not add new baseline packs. It tightens how the existing Baseline Decision Card is presented, checked, and governed so users do not confuse recommendations with approval.

## What Changed

- Changed BL2 resolver wording to say `BL2_INDUSTRIAL` is a candidate path for human review.
- Added explicit baseline-decision smoke/check/example steps to first-party PR and release workflows.
- Added generated-project smoke coverage for `baseline-decision` and `baseline-decision-check`.
- Clarified that `baseline-decision` prints only and does not save a decision card automatically.
- Documented the explicit save path using `new-workflow-item --type baseline-decision-card`.
- Declared active `@coffeecoproject` CODEOWNERS rules for governance-sensitive areas.
- Updated self-check expectations so CODEOWNERS ownership and baseline-decision CI visibility cannot drift silently.

## Allowed Claims

- 1.17.1 makes Baseline Decision Card wording safer and clearer.
- 1.17.1 makes first-party CI show baseline-decision coverage explicitly.
- 1.17.1 documents the difference between printing a recommendation and saving a reviewed record.
- 1.17.1 declares active repository ownership for standard packs, industrial packs, scripts, core workflow files, and GitHub workflow assets.

## Forbidden Claims

- Do not claim 1.17.1 adds new baseline packs.
- Do not claim 1.17.1 makes BL2 default.
- Do not claim a Baseline Decision Card selects or activates BL2.
- Do not claim a Baseline Decision Card approves target-project writes.
- Do not claim a Baseline Decision Card approves implementation.
- Do not claim a Baseline Decision Card approves release or production.
- Do not claim a Baseline Decision Card approves security, privacy, legal, compliance, payment, finance, tax, HR, migration, or irreversible data decisions.
- Do not claim real-project production validation.

## Evidence Status

- Self-check, fixture, manifest, generated-project, and simulated example evidence only.
- CI workflow files now include explicit 1.17 baseline-decision steps, but this release record does not claim a remote Actions run result.
- No target production project was modified by this release.
- No commercial delivery readiness is claimed.

## Known Limitations

- Baseline Decision Cards remain recommendation records only.
- BL2 remains candidate-only until selected packs, BL2 evidence, residual risk, and human approval are recorded.
- Active CODEOWNERS rules identify repository ownership, but required review still depends on GitHub branch-protection settings.
- The resolver still relies on local repository signals and can produce false positives or false negatives until calibrated on more real read-only projects.

## Verification

Required checks:

```bash
node scripts/cli.mjs baseline-decision .
node scripts/cli.mjs baseline-decision-check .
node scripts/check-guided-baseline-selection.mjs examples/1.17-guided-baseline-selection/new-miniprogram --strict
node scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

## Next

The next substantial phase should be evidence calibration, not new pack expansion.

Use sanitized real read-only projects to measure false positives and false negatives for baseline level, backend scope, release sensitivity, payment/value-transfer signals, and production sensitivity.
