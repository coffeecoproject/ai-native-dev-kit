# Release 1.77.2

## Theme

Test Evidence Installation And Schema Contract Sync.

## Summary

1.77.2 closes the installation and schema-contract gaps left after 1.77.1.

This patch formally marks the stricter Test Evidence artifact shape as schema `1.77.1`, regenerates source examples and bad fixtures to that schema, and makes the PR generated-project smoke visibly run the full BRC -> CIC -> Verification Plan -> Test Evidence strict binding chain.

## Boundary

This release does not execute tests, approve implementation, approve release or production, or make Execution Assurance consume Test Evidence by default.

`TEST_EVIDENCE_COMPLETE` means every required Verification Plan obligation has recorded Test Evidence coverage. It does not mean the whole task, product, release, or real environment is complete.

## Allowed Claims

- The strict Test Evidence artifact shape is now explicitly identified as schema `1.77.1`.
- `resolve-test-evidence.mjs` emits `schema_version: 1.77.1`.
- Existing 1.77 Test Evidence examples and fixtures were regenerated with matching `test_evidence_digest` values.
- Generated-project PR smoke now visibly resolves and checks Test Evidence after Verification Plan generation.
- Test Evidence Markdown/JSON consistency now includes reason fields for coverage, quality controls, known gaps, manual verification, and existing-project mapping.

## Forbidden Claims

- This release does not run project tests.
- This release does not prove an implementation is correct.
- This release does not approve implementation, release, production, migration, secrets, payment, providers, CI, hooks, or customer-data actions.
- This release does not make Execution Assurance require Test Evidence by default.
- This release does not prove real-environment behavior.

## Evidence Status

- `schemas/artifacts/test-evidence.schema.json` advertises schema `1.77.1`.
- `scripts/resolve-test-evidence.mjs` emits schema `1.77.1`.
- `.github/workflows/intentos-pr-checks.yml` includes generated-project Test Evidence resolver/checker steps.
- `scripts/check-test-evidence.mjs` compares additional Markdown/JSON reason fields.
- `examples/1.77-test-evidence-binding/appointment-service-time/test-evidence-reports/001-service-time.md` and Test Evidence bad fixtures use schema `1.77.1`.

## Known Limitations

- Test Evidence Binding remains a recording and checking layer, not a test runner.
- Existing Test Evidence reports using schema `1.77.0` should be regenerated or migrated before strict checks are used.
- Product correctness, real-environment behavior, release approval, and production readiness remain outside this release.
- Existing projects still need their project-owned test conventions mapped before Test Evidence can be treated as useful closure evidence.

## Verification

Expected local verification:

```bash
node --check scripts/resolve-test-evidence.mjs
node --check scripts/check-test-evidence.mjs
node scripts/check-test-evidence.mjs examples/1.77-test-evidence-binding/appointment-service-time --report test-evidence-reports/001-service-time.md --require-structured-evidence --require-verification-plan-ref --strict-source-binding --require-current-evidence --require-test-quality-controls
node scripts/check-intentos.mjs
npm run verify
git diff --check
```
