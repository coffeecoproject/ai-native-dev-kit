# 1.50 Evidence Reference Resolution Example

This example calibrates the 1.50 strict close-out path.

It uses the 1.49 structured contract input rule report plus real evidence files, then checks the linked Execution Closure in strict impact mode.

Run:

```bash
node scripts/check-change-impact-coverage.mjs examples/1.49-structured-impact-coverage/contract-input-rule --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs
node scripts/check-execution-closure.mjs examples/1.49-structured-impact-coverage/contract-input-rule --require-impact-coverage
```

Expected result:

```text
Change Impact Coverage check passed.
Execution Review Closure check passed.
```

The example does not approve implementation, commit, push, release, or production.
