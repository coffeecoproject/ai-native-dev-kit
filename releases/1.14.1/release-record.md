# Release 1.14.1: Standard Baseline Registry Hardening

## Human Summary

1.14.1 tightens the 1.14 standard baseline pack registry without adding new packs or changing defaults.

## Changed

- `scripts/resolve-baseline-packs.mjs` is marked as a deprecated lower-level industrial resolver for human entry; `node scripts/cli.mjs baseline-packs <project>` is the standard-first umbrella command.
- `standard-baseline-packs/schema/standard-pack.schema.json` now rejects unknown root metadata fields. Future extra fields must live under `extensions`.
- `scripts/check-standard-baseline-pack.mjs` rejects unknown pack metadata fields.
- `scripts/check-standard-baseline-selection.mjs` validates selected profile ids against `profiles/` and `.ai-native/profiles/`.
- Public documentation URL handling was calibrated so public docs do not trigger private URL or bundle-id false positives.
- 1.14 release verification now lists standard baseline commands explicitly.

## Added

- Bad fixture for unknown selected profile.
- Bad fixture for unknown standard pack metadata field.
- Release evidence for the 1.14.1 hardening patch.

## Allowed Claims

- Standard baseline pack metadata validation is stricter.
- Standard baseline selection reports now validate selected profile ids.
- Public documentation URLs have a small allowlist for standard pack docs.
- The old industrial resolver is still available for exact evidence but is not the preferred human entry.

## Forbidden Claims

- Do not claim new standard packs were added.
- Do not claim draft standard packs are stable.
- Do not claim BL2 is default.
- Do not claim pack selection authorizes target-project writes.
- Do not claim pack selection approves implementation.
- Do not claim release, production, compliance, security, or privacy approval.
- Do not claim real-project production validation.

## Evidence Status

- Self-check and fixture evidence only.
- No target project was scanned or modified.
- No production project validation is claimed.

## Known Limitations

- The three standard packs remain draft examples, not complete stable platform baselines.
- 1.14.1 does not add new platform-specific BL0/BL1/BL2 baseline pack sets.
- The public URL allowlist is narrow and documentation-focused.
- CODEOWNERS remains documented but not enforced until real maintainer handles are confirmed.
- This patch hardens registry checks only; it does not prove real-project delivery readiness.

## Verification

Expected release checks:

```bash
node --check scripts/resolve-baseline-packs.mjs
node --check scripts/check-standard-baseline-pack.mjs
node --check scripts/check-standard-baseline-selection.mjs
node scripts/resolve-baseline-packs.mjs .
node scripts/resolve-baseline-packs.mjs . --json
node scripts/check-standard-baseline-pack.mjs .
node scripts/check-standard-baseline-selection.mjs examples/1.14-standard-baseline-registry --strict --compare-resolver
node scripts/check-standard-baseline-pack.mjs test-fixtures/bad/bad-standard-pack-unknown-field
node scripts/check-standard-baseline-selection.mjs test-fixtures/bad/bad-standard-selection-unknown-profile
node scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```
