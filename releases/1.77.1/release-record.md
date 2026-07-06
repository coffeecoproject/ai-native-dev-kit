# Release 1.77.1

## Theme

Test Evidence Identity Hardening.

## Summary

1.77.1 tightens Test Evidence Binding so a task cannot be treated as verified by weak or unresolved evidence.

The patch keeps the Test Evidence artifact schema version at `1.77.0`, but adds stricter required fields and checker behavior:

- command/test-report evidence records `exit_code` and `failure_reason`;
- `PASSED` command/test-report evidence must have `exit_code` `0`;
- failed command/test-report evidence must record a non-zero `exit_code` or a concrete failure reason;
- `PASSED` and `COVERED` evidence must use resolvable `artifact:` refs with matching output digests;
- required Verification Plan test-correctness controls must be preserved in Test Evidence;
- generated-project smoke now proves BRC -> CIC -> Verification Plan -> Test Evidence strict binding.

## Boundary

This release does not execute tests, approve implementation, approve release or production, or make Execution Assurance consume Test Evidence by default.

`TEST_EVIDENCE_COMPLETE` means every required Verification Plan obligation has recorded Test Evidence coverage. It does not mean the whole task, product, release, or real environment is complete.

## Allowed Claims

- Test Evidence items now record `exit_code` and `failure_reason`.
- `PASSED` command/test-report evidence requires `exit_code` `0`.
- Covered obligations require evidence refs that resolve to artifacts with matching output digests.
- Required Verification Plan test-correctness controls must be preserved in Test Evidence.
- Generated-project smoke covers BRC, CIC, Verification Plan, and Test Evidence strict binding.

## Forbidden Claims

- This release does not run project tests.
- This release does not prove the implementation is correct.
- This release does not approve implementation, release, production, migration, secrets, payment, providers, CI, hooks, or customer-data actions.
- This release does not make Execution Assurance require Test Evidence by default.
- This release does not prove real-environment behavior.

## Evidence Status

- `scripts/resolve-test-evidence.mjs` emits `exit_code` and `failure_reason`.
- `scripts/check-test-evidence.mjs` checks command result semantics, artifact refs, digest matches, and required Verification Plan test-correctness controls.
- `test-fixtures/bad/bad-test-evidence-passed-unresolved-nonartifact-ref` proves non-artifact passed evidence is rejected.
- `test-fixtures/bad/bad-test-evidence-passed-missing-ref` proves passed evidence without a usable ref is rejected.
- `scripts/check-intentos.mjs` includes generated-project Test Evidence strict binding smoke.

## Known Limitations

- Test Evidence Binding remains a recording and checking layer, not a test runner.
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
