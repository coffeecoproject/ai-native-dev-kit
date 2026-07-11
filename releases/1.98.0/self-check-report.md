# IntentOS 1.98.0 Self-Check Report

## Scope

- public Operating Entry and task-chain enforcement;
- strict evidence and schema authority;
- controlled plan, apply, rollback, activation, and receipt behavior;
- baseline selection and generated-project distribution parity;
- release review input and package identity separation.

## Results

| Check | Result |
|---|---|
| `node --test tests/operating-model.test.mjs` | PASS |
| `node --test tests/manifest-authority.test.mjs` | PASS |
| `node --test tests/execution-distribution-trust.test.mjs` | PASS |
| `node scripts/check-fixtures.mjs` | PASS |
| `node scripts/check-manifest.mjs` | PASS |
| `node scripts/check-intentos.mjs` | PASS |
| generated-project release-channel smoke | PASS |
| controlled apply receipt current-state recheck | PASS |
| `npm run verify` | PASS |
| `git diff --check` | PASS |

## Boundary

These checks prove repository and disposable synthetic-project behavior. They
do not authorize or prove production deployment, provider state, external
human identity, business correctness, product correctness, compliance, or
project-owner decisions.
