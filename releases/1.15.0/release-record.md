# Release 1.15.0: Platform Standard Baseline Packs

## Human Summary

1.15.0 completes the first platform-facing standard baseline layer.

Codex can now recommend ordinary draft standard packs for Web, Mini Program, iOS, Android, backend API, internal admin, and environment setup before considering optional industrial overlays.

## Added

- `miniprogram-runtime-standard`
- `ios-app-standard`
- `android-app-standard`
- `internal-admin-standard`
- `environment-standard`
- `docs/platform-standard-baseline-packs-1.15-plan.md`
- `docs/platform-standard-baseline-packs.md`
- `docs/reference/platform-standard-baseline-matrix.md`
- `examples/1.15-platform-standard-baselines/`
- bad fixtures for over-selection, forced backend, BL2 defaulting, industrial/standard mixing, write/release overclaims, draft-stable wording, existing-project overwrite language, unknown pack, and resolver mismatch

## Changed

- `web-runtime-standard` and `backend-api-standard` can be recommended for BL0 as lightweight platform or backend structure.
- `scripts/check-standard-baseline-selection.mjs` now rejects:
  - selecting all known standard packs
  - forcing backend on frontend or Mini Program projects without backend scope evidence
  - recommending release / rollback without release scope evidence
  - overwrite language for governed, production-sensitive, or dirty existing projects
- Standard baseline docs now explain platform baseline behavior and the platform matrix.

## Allowed Claims

- The dev kit now has draft standard packs for common platforms and project shapes.
- The resolver can recommend platform standard packs before optional industrial overlays.
- Backend and release packs remain conditional.
- Existing governed projects stay on read-only mapping and gap-review language.

## Forbidden Claims

- Do not claim new packs are stable.
- Do not claim platform standard packs are industrial packs.
- Do not claim BL2 is default.
- Do not claim industrial overlays are active by default.
- Do not claim standard baseline selection authorizes target-project writes.
- Do not claim standard baseline selection approves implementation.
- Do not claim release, production, compliance, security, privacy, payment, tax, finance, HR, legal, or migration approval.
- Do not claim real-project production validation.

## Evidence Status

- Self-check, fixture, and simulated example evidence only.
- No target project was modified.
- No production validation is claimed.

## Known Limitations

- All new 1.15 packs are draft.
- The platform matrix is an initial standard baseline matrix, not a complete industrial baseline catalog.
- iOS and Android examples prove resolver/checker routing, not store submission readiness.
- Existing governed project examples are read-only and do not prove controlled apply in a real project.
- Environment facts remain pending unless proven by project files or human confirmation.

## Verification

Expected release checks:

```bash
node scripts/check-standard-baseline-pack.mjs .
node scripts/check-standard-baseline-selection.mjs examples/1.15-platform-standard-baselines/new-miniprogram-basic --strict --compare-resolver
node scripts/check-standard-baseline-selection.mjs examples/1.15-platform-standard-baselines/new-miniprogram-with-backend --strict --compare-resolver
node scripts/check-standard-baseline-selection.mjs examples/1.15-platform-standard-baselines/new-internal-admin-web --strict --compare-resolver
node scripts/check-standard-baseline-selection.mjs examples/1.15-platform-standard-baselines/new-ios-app --strict --compare-resolver
node scripts/check-standard-baseline-selection.mjs examples/1.15-platform-standard-baselines/new-android-app --strict --compare-resolver
node scripts/check-standard-baseline-selection.mjs examples/1.15-platform-standard-baselines/existing-governed-project-gap-review --strict --compare-resolver
node scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```
