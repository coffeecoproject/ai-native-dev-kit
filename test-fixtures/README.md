# Test Fixtures

This directory contains the fixture case registry and negative fixtures for the dev-kit's governance checkers.

Positive cases live under `examples/` and are referenced from `fixture-cases.json`.

Fixtures are not starter projects and are not copied into target projects.

Use:

```bash
node scripts/check-fixtures.mjs
```

Rules:

- Good cases from `examples/` must pass.
- Bad cases from `test-fixtures/` must fail for an expected reason.
- Failure assertions check output text, not only exit code.
- Fixtures must not scan real project source code.
