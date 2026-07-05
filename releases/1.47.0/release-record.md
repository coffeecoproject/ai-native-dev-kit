# Release 1.47.0

## Release Summary

1.47.0 is the Evidence Reliability & Risk Calibration release.

It hardens the ordinary-user product loop from 1.42-1.46 by making local product evidence more reliable, calibrating shared risk-surface checks, adding a non-Web MVP example, and cleaning up structured apply-candidate source evidence naming.

## What Changed

- Added `docs/plans/evidence-reliability-risk-calibration-1.47-plan.md`.
- Added `schemas/artifacts/product-completeness-evidence.schema.json`.
- Updated `resolve-product-completeness` to read structured JSON evidence as well as legacy text evidence.
- Updated bundled MVP smoke tests to write deterministic text and JSON evidence.
- Added `examples/mvp-cli-note-tool` as a non-Web local MVP example.
- Generalized `check-mvp-example` so examples can declare required files and markers through `package.json`.
- Updated `check-product-completeness` source evidence to include structured product evidence.
- Updated `check-low-risk-apply-candidate` source evidence wording and required schema coverage.
- Calibrated shared risk surfaces so benign `workflow`, `key metric`, and `package display text` wording does not trigger high risk by itself.
- Added `baseline-calibration-reports/risk-surface-false-positives.md`.
- Added the `intentos` CLI alias while keeping `intentos` as compatibility alias.

## Allowed Claims

- 1.47.0 improves evidence reliability for local MVP examples by supporting structured product completeness evidence.
- 1.47.0 includes Web and non-Web local MVP example shapes: booking app, dashboard app, and CLI note tool.
- 1.47.0 calibrates shared risk-surface detection to reduce benign wording false positives while keeping high-risk surfaces conservative.
- 1.47.0 keeps low-risk apply candidate checks as reviewable records only, not apply approval.

## Evidence Status

Planned verification:

```bash
node scripts/check-low-risk-apply-candidate.mjs examples/1.45-low-risk-apply-candidate --require-structured-evidence
node scripts/resolve-product-completeness.mjs examples/mvp-booking-web-app --evidence evidence/smoke-output.json
node scripts/resolve-product-completeness.mjs examples/mvp-cli-note-tool --evidence evidence/smoke-output.json
node scripts/check-mvp-example.mjs examples/mvp-booking-web-app
node scripts/check-mvp-example.mjs examples/mvp-dashboard-web-app
node scripts/check-mvp-example.mjs examples/mvp-cli-note-tool
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Known Limitations

- Structured product evidence improves local evidence reliability, but it does not prove real-user adoption or production readiness.
- Risk-surface analysis remains heuristic and conservative.
- `examples/mvp-cli-note-tool` is a local CLI demo and does not persist data.
- Target projects can still use legacy text evidence unless a strict checker mode explicitly requires structured evidence.
- Change Impact Coverage is planned for 1.48 and is not implemented in this release.

## Forbidden Claims

- Do not claim 1.47.0 adds an apply runner.
- Do not claim 1.47.0 writes target-project files by itself.
- Do not claim structured product evidence approves implementation, release, production, or real-user readiness.
- Do not claim risk calibration lowers safety for secrets, CI, hooks, payment, permissions, migration, data, or production.
- Do not claim 1.47.0 implements Change Impact Coverage.

## Verification

- `node scripts/check-low-risk-apply-candidate.mjs examples/1.45-low-risk-apply-candidate --require-structured-evidence`
- `node scripts/resolve-product-completeness.mjs examples/mvp-booking-web-app --evidence evidence/smoke-output.json`
- `node scripts/resolve-product-completeness.mjs examples/mvp-cli-note-tool --evidence evidence/smoke-output.json`
- `node scripts/check-mvp-example.mjs examples/mvp-booking-web-app`
- `node scripts/check-mvp-example.mjs examples/mvp-dashboard-web-app`
- `node scripts/check-mvp-example.mjs examples/mvp-cli-note-tool`
- `node scripts/check-product-completeness.mjs .`
- `node scripts/check-manifest.mjs`
- `node scripts/check-fixtures.mjs`
- `node scripts/check-intentos.mjs`
- `npm run verify`
- `git diff --check`

## Outcome

`RELEASE_RECORDED`
