# Release Record: 1.13.0 Baseline Pack System

## Human Summary

1.13.0 adds a read-only Baseline Pack System so Codex can recommend BL level, selected profiles, platform packs, capability packs, and risk overlays without treating recommendations as approval.

## Scope

- Add Baseline Pack System docs, template, checklist, prompt, and report directory.
- Add `resolve-baseline-packs.mjs` for read-only recommendations.
- Add `check-baseline-pack-selection.mjs` for report boundary checks.
- Add CLI commands `baseline-packs` and `baseline-pack-selection`.
- Wire generated-project assets, README/reference docs, manifest, and self-check.

## Allowed Claims

- Codex can produce a read-only baseline pack recommendation.
- Baseline pack selection reports can be checked for overclaims.
- The system separates primary platform, capability, and risk overlay packs.
- BL2, draft pack acceptance, and target-project writes remain human decisions.

## Forbidden Claims

- This release does not promote industrial packs to stable.
- This release does not make BL2 default.
- This release does not select all packs by default.
- This release does not approve target-project writes.
- This release does not prove real-project production readiness.
- This release does not add legal, security, platform, payment, release, or production approval authority.

## Evidence Status

- Source assets: PASS
- Manifest: PASS
- Self-check: PASS
- Release verify: PASS
- Real-project validation: not claimed

## Verification

```bash
node --check scripts/resolve-baseline-packs.mjs
node --check scripts/check-baseline-pack-selection.mjs
node scripts/cli.mjs baseline-packs .
node scripts/check-baseline-pack-selection.mjs .
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Known Limitations

See `releases/1.13.0/known-limitations.md`.
