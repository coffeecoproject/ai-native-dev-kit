# IntentOS 1.105.0 Self-Check Report

## Result

`PASS`

## Required Checks

- strict schema and digest validation;
- six-plane discovery and separation;
- legacy compatibility translation;
- copied and tampered evidence rejection;
- zero-experience user-contract regression;
- generated-project parity;
- full repository verification.

## Evidence

- `node --test tests/release-execution-topology.test.mjs`
- `node scripts/check-review-context-authority.mjs .`
- `node scripts/check-manifest.mjs .`
- `node scripts/check-intentos.mjs`
- generated-project topology resolution, strict checking, and distribution
  parity inside the full self-check

## Result Detail

The six-plane model, zero-experience responsibility boundary, source-chain and
digest validation, copied/tampered evidence failures, compatibility behavior,
and generated-project parity passed. This does not prove any real provider or
production topology.
