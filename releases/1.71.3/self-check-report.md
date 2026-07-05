# 1.71.3 Self-Check Report

This self-check covers Adoption Assurance Evidence Closure for 1.71.3.

## Scope

- Adoption Assurance evidence ref closure.
- Unknown evidence prefix rejection.
- Typed source authority blocking.
- Explicit resolver `--out` report generation.
- Documentation index and reference coverage for the old-project adoption chain.

## Commands

```bash
node --check scripts/resolve-adoption-assurance.mjs
node --check scripts/resolve-governance-convergence.mjs
node --check scripts/check-adoption-assurance.mjs
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/verified-existing-project --require-structured-evidence --require-simulation
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/partial-existing-project --require-structured-evidence
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/blocked-production-project --require-structured-evidence
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/failed-assurance --require-structured-evidence
node scripts/check-adoption-assurance.mjs test-fixtures/bad/bad-adoption-assurance-unknown-evidence-prefix --require-structured-evidence
node scripts/check-adoption-assurance.mjs test-fixtures/bad/bad-adoption-assurance-surface-evidence-not-in-evidence-refs --require-structured-evidence
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
```

## Expected Result

- Positive examples pass strict checks.
- Bad fixtures fail strict checks.
- The resolver-generated `--out` report can be checked as the same artifact.
- `check-manifest` and `check-dev-kit` pass.

