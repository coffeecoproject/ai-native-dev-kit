# Release Record: 1.12.1 Manifest, README & Fallback Sync

## Human Summary

1.12.1 is a calibration patch for 1.12.0. It fixes manifest phase drift, updates README self-check guidance, and syncs fallback workflow asset checks with the 1.12 asset set.

## Scope

- Align `compatibilityPolicy.phase` with `intentOSVersion`.
- Add manifest phase equality checks to `check-manifest` and intentos self-check.
- Add `npm run verify` and 1.12 checkers to README self-check blocks.
- Sync `check-ai-workflow` fallback required paths with 1.12 assets.
- Update version metadata and release evidence.

## Allowed Claims

- Manifest phase drift is now checked.
- README self-check guidance now includes the 1.12 checks and `npm run verify`.
- `check-ai-workflow` fallback paths now include 1.12 assets.
- Full intentos verification passes after this patch.

## Forbidden Claims

- This release does not add standard baseline packs.
- This release does not assign real CODEOWNERS.
- This release does not add automatic GPT/API review.
- This release does not automatically scan real projects.
- This release does not approve target-project writes.
- This release does not prove production adoption or commercial delivery readiness.

## Evidence Status

- Source assets: PASS
- Manifest: PASS
- Self-check: PASS
- Release verify: PASS
- Real-project validation: not claimed

## Verification

```bash
node --check scripts/check-manifest.mjs
node --check scripts/check-ai-workflow.mjs
node --check scripts/check-intentos.mjs
node --check scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs --case "migration manifest version mismatch"
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Known Limitations

See `releases/1.12.1/known-limitations.md`.
