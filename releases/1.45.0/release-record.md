# Release 1.45.0 Record

## Theme

Low-risk controlled apply candidate layer.

## Allowed Claims

- The release adds a read-only candidate record for small, exact, reversible, testable proposed changes.
- The release adds resolver, checker, example, bad fixtures, and docs.

## Forbidden Claims

- Do not claim that 1.45 can apply changes automatically.
- Do not claim that candidate records approve implementation, release, CI, hooks, production, payment, permission, migration, or secrets work.

## Evidence

- `core/low-risk-controlled-apply-candidate.md`
- `scripts/resolve-low-risk-apply-candidate.mjs`
- `scripts/check-low-risk-apply-candidate.mjs`
- `examples/1.45-low-risk-apply-candidate/`
- `test-fixtures/bad/bad-apply-candidate-*`

## Evidence Status

- Source assets are present in the repository and listed in `dev-kit-manifest.json`.
- Positive example evidence is recorded under `examples/1.45-low-risk-apply-candidate/`.
- Negative fixtures cover apply authorization, broad paths, and high-risk surface misuse.
- This evidence is Dev Kit governance evidence only; it is not production validation for a target project.

## Known Limitations

- 1.45 does not implement a writer, apply runner, scheduler, hook installer, CI modifier, or production deployment path.
- A candidate record does not approve implementation or release.
- High-risk changes still require the existing human-owned plan, readiness, approval, and review path.

## Verification

- `node scripts/check-low-risk-apply-candidate.mjs examples/1.45-low-risk-apply-candidate`
- `node scripts/check-low-risk-apply-candidate.mjs test-fixtures/bad/bad-apply-candidate-authorizes-run`
- `node scripts/check-low-risk-apply-candidate.mjs test-fixtures/bad/bad-apply-candidate-broad-path`
- `node scripts/check-low-risk-apply-candidate.mjs test-fixtures/bad/bad-apply-candidate-high-risk`
- `node scripts/check-dev-kit.mjs`
- `npm run verify`

## Status

Implemented and verified.
