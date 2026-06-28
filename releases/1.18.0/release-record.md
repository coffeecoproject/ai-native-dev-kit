# Release 1.18.0: Guided Baseline Selection Calibration

## Human Summary

1.18.0 calibrates baseline selection after read-only trials on real local
projects.

It makes Codex clearer about what is safe to do now, what is only a candidate
later, and which platform signals are actually active.

## What Changed

- Separated `current safe action` from `target candidate level` in Baseline
  Decision Cards.
- Added `Platform States` with selected, present-but-unconfirmed, deferred, and
  not-detected profile states.
- Updated Mini Program cloud-function detection so backend/API scope becomes
  possible and needs confirmation instead of staying invisible.
- Tightened internal-admin detection so permission/RBAC vocabulary alone does
  not infer an admin console.
- Aligned the legacy `baseline` output with guided baseline language so BL1
  safe action and BL2 candidate target do not look contradictory.
- Added 1.18 self-check coverage for Mini Program cloud functions, internal
  admin false positives, and large monorepo platform-state output.

## Allowed Claims

- 1.18.0 makes baseline recommendations easier to understand.
- 1.18.0 distinguishes safe action from BL2 candidate target.
- 1.18.0 improves Mini Program cloud-function backend-scope detection.
- 1.18.0 improves internal-admin precision.
- 1.18.0 improves monorepo platform-state explanation.

## Forbidden Claims

- 1.18.0 does not add new packs.
- Do not claim 1.18.0 adds new baseline packs.
- Do not claim 1.18.0 promotes draft packs.
- Do not claim 1.18.0 makes BL2 default.
- Do not claim a BL2 candidate is selected or active.
- Do not claim target-project writes are approved.
- Do not claim implementation, release, production, security, privacy,
  compliance, payment, finance, tax, HR, migration, or irreversible data
  decisions are approved.
- Do not claim real-project production validation.

## Evidence Status

- Evidence is based on sanitized local read-only calibration reports and
  synthetic self-check fixtures.
- No target project was modified by this release.
- No production or commercial readiness is claimed.

## Known Limitations

- Selector output is still heuristic and requires human confirmation for real
  project adoption.
- Platform states explain what Codex detected; they do not prove that a
  platform is active for the current delivery task.
- BL2 remains candidate-only until evidence and human approval are recorded.
- The release does not add new packs, promote draft packs, approve writes, or
  validate production readiness.

## Verification

Required checks:

```bash
node scripts/cli.mjs baseline-decision .
node scripts/cli.mjs baseline .
node scripts/cli.mjs baseline-decision-check .
node scripts/check-guided-baseline-selection.mjs examples/1.17-guided-baseline-selection/new-miniprogram --strict
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

## Next

The next step should be further fixture hardening or a controlled real-project
adapter dry run. It should not be a new baseline-pack expansion unless the
selection precision remains stable.
