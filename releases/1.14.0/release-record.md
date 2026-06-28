# Release 1.14.0: Standard Baseline Pack Registry

## Human Summary

1.14.0 separates ordinary standard baseline packs from BL2 industrial overlays.

## Added

- `standard-baseline-packs/` registry.
- Three draft standard packs:
  - `web-runtime-standard`
  - `backend-api-standard`
  - `release-rollback-standard`
- `core/standard-baseline-pack-registry.md`
- `docs/standard-baseline-pack-registry.md`
- `docs/reference/standard-baseline-packs.md`
- `templates/standard-baseline-selection-report.md`
- `checklists/standard-baseline-selection-review.md`
- `prompts/standard-baseline-router-agent.md`
- `scripts/resolve-standard-baseline.mjs`
- `scripts/check-standard-baseline-pack.mjs`
- `scripts/check-standard-baseline-selection.mjs`
- CLI commands:
  - `standard-baseline`
  - `standard-baseline-selection`

## Changed

- `baseline-packs` now works as an umbrella read-only recommendation: standard packs first, optional industrial overlays second.
- CI and generated-project smoke checks now expose standard baseline checks directly.
- README and reference docs explain standard baseline packs separately from industrial packs.

## Allowed Claims

- The dev kit now has a separate standard baseline pack registry.
- Standard packs are draft ordinary engineering guardrails.
- Industrial packs remain optional BL2 overlays.
- Recommendations are read-only.

## Forbidden Claims

- Do not claim standard packs are stable.
- Do not claim real production validation.
- Do not claim pack selection approves implementation.
- Do not claim pack selection authorizes target-project writes.
- Do not claim release, production, compliance, security, or privacy approval.
- Do not claim BL2 is required for every serious project.

## Evidence Status

- Simulated and self-check evidence only.
- Real-project production validation is not claimed.

## Known Limitations

- The three standard packs are draft mechanism examples, not stable platform baselines.
- The registry recommends candidates only; humans still confirm pack selection and project fit.
- The resolver does not create, modify, or verify target-project implementation files.
- Industrial overlays remain optional and inactive unless explicitly selected and reviewed.

## Verification

Expected release checks:

```bash
node scripts/cli.mjs standard-baseline .
node scripts/check-standard-baseline-pack.mjs .
node scripts/check-standard-baseline-selection.mjs .
node scripts/cli.mjs baseline-packs .
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```
