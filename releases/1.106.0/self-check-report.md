# IntentOS 1.106.0 Self-Check Report

## Result

`PASS`

## Required Checks

- strict topology source validation;
- consumer source-chain agreement;
- copied, stale, tampered, and absent topology rejection;
- candidate/package/action mismatch rejection;
- dual publishing trigger rejection;
- generated-project parity;
- full repository verification.

## Evidence

- `node --test tests/release-topology-consumer.test.mjs`
- `node scripts/check-claim-control.mjs .`
- `node scripts/check-manifest.mjs .`
- `node scripts/check-intentos.mjs`
- generated-project strict empty-state failures for Release Evidence, Release
  Approval, Release Execution, and Runtime Hygiene

## Result Detail

Exact topology source binding, project and source identity, candidate/package/
action agreement, copied/stale evidence rejection, dual publishing trigger
rejection, and generated-project consumer parity passed. This does not approve
or execute a release.
