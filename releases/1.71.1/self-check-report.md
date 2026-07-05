# 1.71.1 Self-Check Report

## Scope

This self-check covers Adoption Assurance Evidence Hardening for 1.71.1.

## Checked Surfaces

- Resolver schema version and structured evidence fields.
- Real read-only simulation step trace.
- Upstream source-system block handling.
- Markdown / JSON summary, simulation, and surface consistency.
- Evidence reference resolution.
- Full-adoption claim guardrails.
- Bad-fixture rejection coverage.

## Required Commands

```bash
node --check scripts/resolve-adoption-assurance.mjs
node --check scripts/check-adoption-assurance.mjs
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/verified-existing-project --require-structured-evidence --require-simulation
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/partial-existing-project --require-structured-evidence
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/blocked-production-project --require-structured-evidence
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/failed-assurance --require-structured-evidence
node scripts/check-dev-kit.mjs
```

## Result

Passed locally.

Additional verification run:

```bash
node scripts/resolve-adoption-assurance.mjs . --json
node scripts/resolve-adoption-assurance.mjs .
node scripts/check-adoption-assurance.mjs .
node scripts/check-manifest.mjs
node scripts/check-claim-control.mjs .
node scripts/check-product-baseline.mjs .
git diff --check
```
