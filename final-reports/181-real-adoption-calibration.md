# Final Report: 1.8.1 Real Adoption Calibration

## Human Summary

Applied the 1.8 review calibration: separated profile and risk-pack wording, added patch false-positive calibration records, and clarified that real-adoption commands check recorded reports rather than auto-generating target-project reports.

## Completed

- Split `high-risk-change` out of source-level Recommended Profiles.
- Added `patch-classification-false-positives/` and `templates/patch-classification-false-positive.md`.
- Extended `check-patch-classification.mjs` to validate false-positive records.
- Added a bad fixture for unsafe false-positive acceptance.
- Added `docs/real-adoption-usage.md`.
- Updated reference docs, README, manifest, workflow version, and 1.8.1 release evidence.

## Verified

- `node --check scripts/check-patch-classification.mjs`
- `node scripts/check-patch-classification.mjs .`
- `node scripts/check-fixtures.mjs`
- `node scripts/check-manifest.mjs`
- `node scripts/check-product-baseline.mjs .`
- `node scripts/check-claim-control.mjs .`
- `node scripts/check-intentos.mjs`
- `git diff --check`

## Not Changed

- No automatic real-project scanning runner was added.
- No target project files were modified.
- No false-positive record approves implementation.
- No patch classification high-risk defaults were weakened.

## Risks Remaining

- More real read-only trials are still needed across project types.
- False-positive calibration remains conservative until enough evidence exists.

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | `DIRECT_FOLLOW_UP` | run additional private read-only trials across project types | future evidence | No | new request | human project choice |
| N2 | `DO_NOT_PROCEED` | add an automatic real-project scanning runner now | intentionally deferred | No | do not proceed | privacy and command-safety controls not ready |

## Human Decisions Needed

None for this intentos calibration.

## Next Safe Action

Review the 1.8.1 changes, then decide whether to commit and push.
