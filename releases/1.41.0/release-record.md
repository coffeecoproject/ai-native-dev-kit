# Release 1.41.0: Structured Evidence Schema

## Summary

1.41.0 adds schema-backed machine-readable evidence for the write-control chain:

- Unified Apply Plan
- Controlled Apply Readiness
- Approval Record

Markdown remains the human-readable record. The new `Machine-Readable Evidence` JSON block lets checkers validate action IDs, exact target paths, boundaries, approval scope, and plan digest relationships.

## What Changed

- Added schemas under `schemas/artifacts/`.
- Added `scripts/lib/artifact-schema.mjs` for lightweight schema validation and canonical evidence digests.
- Updated apply/readiness/approval checkers to validate structured evidence when present.
- Added digest cross-checks from readiness and approval records back to the referenced apply plan.
- Updated templates to include structured evidence blocks.
- Added a 1.41 structured evidence example and bad fixtures.

## Boundary

- No controlled apply runner is added.
- No target files are written by the new schema checks.
- No automatic apply authority is granted.
- No implementation, release, production, hook, CI, secret, migration, or BL2 approval is granted.
- Existing historical Markdown examples remain supported by semantic checks.

## Allowed Claims

- This release adds schema-backed machine-readable evidence blocks for Unified Apply Plan, Controlled Apply Readiness, and Approval Record artifacts.
- Checkers validate structured evidence when present and keep existing Markdown semantic checks as compatibility fallback.
- Unified Apply Plan structured evidence includes a recomputable canonical digest.
- Controlled Apply Readiness and Approval Record structured evidence can be checked against the referenced apply plan digest when that plan is available locally.
- This release improves evidence integrity for the write-control chain.

## Forbidden Claims

- Do not claim that 1.41.0 can execute apply plans.
- Do not claim that structured evidence grants Codex authority to write files.
- Do not claim that Approval Record validates real human identity.
- Do not claim that this release approves implementation, release, production, hooks, CI, secrets, migrations, payments, security, privacy, legal, BL2, or industrial packs.
- Do not claim that Markdown compatibility fallback is removed.

## Evidence Status

| Evidence | Status |
|---|---|
| Schemas under `schemas/artifacts/` | Local repository evidence |
| `scripts/lib/artifact-schema.mjs` | Local repository evidence |
| 1.41 structured example | Local repository evidence |
| Bad structured digest fixtures | Local repository evidence |
| Full verification | Pending final self-check update |

## Known Limitations

- Real human identity is still not cryptographically validated.
- Schema validation is intentionally lightweight and local to this repository.
- Structured evidence improves evidence integrity, but it is not an execution engine.
- Controlled apply execution remains a future candidate.

## Verification

- `node --check scripts/lib/artifact-schema.mjs`
- `node --check scripts/check-apply-plan.mjs`
- `node --check scripts/check-controlled-apply-readiness.mjs`
- `node --check scripts/check-approval-record.mjs`
- `node scripts/check-apply-plan.mjs examples/1.41-structured-evidence-schema`
- `node scripts/check-controlled-apply-readiness.mjs examples/1.41-structured-evidence-schema`
- `node scripts/check-approval-record.mjs examples/1.41-structured-evidence-schema`
