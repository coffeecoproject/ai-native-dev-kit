# Test Fixtures

This directory contains the fixture case registry and typed fixtures for the dev-kit's governance checkers.

The matrix is organized by purpose:

- `golden/`: passing reference behavior. Some golden cases reference `examples/` directly.
- `bad/`: intentionally invalid cases that must fail for a known reason.
- `migrations/`: backward-compatibility and migration behavior.
- `cli/`: CLI facade smoke cases.
- `init-update/`: init/update dry-run and plan-first behavior.
- `output-quality/`: report quality cases.

Fixtures are not starter projects and are not copied into target projects.

Use:

```bash
node scripts/check-fixtures.mjs
```

Rules:

- Golden cases must pass.
- Bad cases must fail for an expected reason.
- Migration cases must warn, skip, or fail exactly as the compatibility policy says.
- Failure assertions check output text, not only exit code.
- Each case must declare `type`, `checker`, expected output, and `howToFix`.
- Fixtures must not scan real project source code.
- Each case should include repair guidance so checker failures are understandable without reading the whole repository.
- Output quality and glossary fixtures are dev-kit hardening assets; they are not target-project gates.
