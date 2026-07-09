# IntentOS 1.86.1 Self-Check Report

## Scope

This self-check covers the Runtime Hygiene `1.86.1` hardening patch:

- source refs and digests for runtime blockers;
- CI environment retry safety proof;
- strict task-entry binding through the shared Work Queue / Task Governance
  checker;
- positive and negative fixture coverage;
- version, manifest, README, and release evidence synchronization.

## Required Checks

Run before release:

```bash
npm run verify:syntax
npm run verify:examples
npm run verify:release
npm run verify
git diff --check
```

## Expected Results

- Runtime Hygiene source repository check passes with `--allow-empty`.
- Existing `1.86.0` Runtime Hygiene examples remain compatible.
- `examples/1.86-runtime-hygiene/ci-environment-retry` passes with
  `--require-runtime-sources`.
- `examples/1.86-runtime-hygiene/strict-task-entry` passes with
  `--strict-task-entry`.
- `bad-runtime-hygiene-ci-auto-without-safety-proof` is rejected.
- `check-intentos` covers the new strict example, bad fixture, and release
  evidence.

## Result

Passed in the release turn.

Verified commands:

```bash
npm run verify:syntax
npm run verify:examples
npm run verify:release
npm run verify
```

Additional targeted checks completed during implementation:

```bash
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/ci-environment-retry --require-structured-evidence --require-runtime-sources
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/strict-task-entry --require-structured-evidence --require-runtime-sources --strict-task-entry
node scripts/check-runtime-hygiene.mjs test-fixtures/bad/bad-runtime-hygiene-ci-auto-without-safety-proof --require-structured-evidence
```

The bad fixture check was expected to fail and did fail because automatic CI
continuation was claimed without retry policy and production side-effect proof.
