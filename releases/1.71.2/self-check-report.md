# 1.71.2 Self-Check Report

## Scope

This self-check covers Adoption Assurance Evidence Precision for 1.71.2.

## Checked Surfaces

- Simulation step exit code evidence.
- Simulation read-only / no target write markers.
- Target diff status and output digest evidence.
- Typed source-status adapters for adoption assurance and governance convergence.
- Generated evidence ref resolution.
- Target-installed vs source-only assurance asset documentation.
- Bad-fixture rejection coverage.

## Required Commands

```bash
node --check scripts/resolve-adoption-assurance.mjs
node --check scripts/check-adoption-assurance.mjs
node --check scripts/resolve-governance-convergence.mjs
git diff --check
node scripts/check-manifest.mjs
node scripts/check-claim-control.mjs .
node scripts/check-product-baseline.mjs .
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/verified-existing-project --require-structured-evidence --require-simulation
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/partial-existing-project --require-structured-evidence
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/blocked-production-project --require-structured-evidence
node scripts/check-adoption-assurance.mjs examples/1.71-adoption-execution-assurance/failed-assurance --require-structured-evidence
node scripts/check-intentos.mjs
```

## Expected Rejections

```bash
node scripts/check-adoption-assurance.mjs test-fixtures/bad/bad-adoption-assurance-simulation-missing-exit-code --require-structured-evidence
node scripts/check-adoption-assurance.mjs test-fixtures/bad/bad-adoption-assurance-simulation-target-diff-changed --require-structured-evidence
node scripts/check-adoption-assurance.mjs test-fixtures/bad/bad-adoption-assurance-unresolved-generated-evidence --require-structured-evidence
```

## Result

Passed local verification in this implementation turn.

- Positive Adoption Assurance examples passed structured evidence checks.
- Bad fixtures were rejected for missing simulation exit code evidence, target file write / changed target diff, and unresolved generated evidence references.
- `check-intentos` passed, including generated-project smoke checks, existing governed project read-only behavior, source-only adoption documentation, and 1.71.2 bad-fixture coverage.
