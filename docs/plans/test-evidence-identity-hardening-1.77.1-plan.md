# Test Evidence Identity Hardening 1.77.1 Plan

## Human Summary

1.77.1 tightens Test Evidence Binding without adding a new workflow layer.

The 1.77.0 model can bind evidence to Verification Plan obligations, but it still leaves several ways for Codex to overclaim:

- a command can be marked `PASSED` without recording its `exit_code`;
- a `PASSED` evidence item can point to a non-artifact or missing ref;
- required Verification Plan test-correctness controls can be weakened or dropped in Test Evidence;
- generated-project smoke can stop at Verification Plan without proving the Test Evidence chain.

1.77.1 fixes those gaps while keeping ordinary users out of technical evidence details. Codex should do the stricter validation and then summarize missing evidence in plain language.

## Scope

In scope:

- Add `exit_code` and `failure_reason` to Test Evidence items.
- Require `COMMAND_OUTPUT` / `TEST_REPORT` evidence marked `PASSED` to have `exit_code` `0`.
- Require failed command/test-report evidence to carry non-zero `exit_code` or a concrete `failure_reason`.
- Require `PASSED` and `COVERED` evidence to use resolvable `artifact:` refs with matching output digests.
- Require Test Evidence to preserve required Verification Plan `test_correctness_controls`.
- Extend generated-project smoke through Test Evidence resolve/check.
- Add bad fixtures for non-artifact and missing refs.
- Update 1.77.0 self-check evidence to record the completed full verification run.

Out of scope:

- Do not make Execution Assurance require Test Evidence by default.
- Do not turn Test Evidence into a test runner.
- Do not approve implementation, release, production, CI, hook, secrets, migrations, payment, permissions, or external systems.
- Do not change product correctness semantics; evidence coverage is not product completion.

## Acceptance Plan

Required checks:

```bash
node --check scripts/resolve-test-evidence.mjs
node --check scripts/check-test-evidence.mjs
node scripts/check-test-evidence.mjs examples/1.77-test-evidence-binding/appointment-service-time --report test-evidence-reports/001-service-time.md --require-structured-evidence --require-verification-plan-ref --strict-source-binding --require-current-evidence --require-test-quality-controls
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Expected behavior:

- Positive 1.77 example passes strict Test Evidence checking.
- Bad fixture with `PASSED` non-artifact ref fails.
- Bad fixture with `PASSED` missing ref fails.
- Generated-project smoke proves BRC -> CIC -> Verification Plan -> Test Evidence strict binding.
- Release/version surfaces consistently show `1.77.1`.
