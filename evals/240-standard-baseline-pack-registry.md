# Eval: Standard Baseline Pack Registry

## Related Spec

`specs/240-standard-baseline-pack-registry.md`

## Acceptance Checks

- `node scripts/check-standard-baseline-pack.mjs .`
- `node scripts/check-standard-baseline-selection.mjs .`
- `node scripts/cli.mjs standard-baseline .`
- `node scripts/cli.mjs baseline-packs .`
- `node scripts/check-manifest.mjs`
- `node scripts/check-dev-kit.mjs`
- `npm run verify`
- `git diff --check`

## Expected Boundaries

- Standard packs are separate from industrial packs.
- `defaultForBL` is not used.
- `activeByDefault` is false.
- Recommendations are not approvals.
- Generated projects receive standard baseline assets.
