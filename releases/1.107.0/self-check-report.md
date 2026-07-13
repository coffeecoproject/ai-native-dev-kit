# IntentOS 1.107.0 Self-Check Report

## Result

`PASS`

## Required Checks

- migration schema, digest, project identity, and exact topology binding;
- six-plane dependency coverage;
- strict apply/rehearsal/cutover/post-cutover/retirement stage failures;
- separate consent and no-authority boundaries;
- copied, stale, tampered, and empty evidence rejection;
- source/generated-project parity;
- full repository verification.

## Evidence

- `node --test tests/release-topology-migration.test.mjs`
- `node scripts/check-claim-control.mjs .`
- `node scripts/check-product-baseline.mjs .`
- `node scripts/check-review-context-authority.mjs .`
- `node scripts/check-manifest.mjs .`
- `node scripts/check-intentos.mjs`
- generated-project discovery-stage migration resolution and strict checking
  inside the full self-check

## Result Detail

Schema, digest, project identity, topology binding, dependency coverage,
stage-specific failure behavior, separate consent boundaries, copied/tampered
evidence rejection, and source/generated-project parity passed. A discovery
record remains non-authorizing and does not prove a real rehearsal, cutover,
release, or backend retirement.
