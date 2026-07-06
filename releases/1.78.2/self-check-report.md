# IntentOS 1.78.2 Self-Check Report

## Status

Passed.

## Commands Run

```bash
node --check scripts/resolve-execution-assurance.mjs
node --check scripts/check-execution-assurance.mjs
node --check scripts/resolve-completion-evidence.mjs
node --check scripts/check-completion-evidence.mjs
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/feature-contract-validation --require-structured-evidence --require-evidence-refs --require-review --require-actual-diff --require-precise-evidence
node scripts/check-completion-evidence.mjs examples/1.78-completion-evidence-gate/appointment-service-time --report completion-evidence-reports/001-service-time.md --require-structured-evidence --require-source-refs --require-ready
node scripts/check-completion-evidence.mjs test-fixtures/bad/bad-completion-evidence-ea-intent-digest-mismatch --report completion-evidence-reports/001-service-time.md --require-structured-evidence --require-source-refs --require-ready
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Result

All required validation passed.

- Syntax checks passed for Execution Assurance and Completion Evidence
  resolver/checker scripts.
- Positive Execution Assurance and Completion Evidence examples passed strict
  checks.
- Completion Evidence bad fixtures reject missing, mismatched, stale, digest
  mismatched, schema-invalid, and Execution-Assurance-intent-mismatched source
  chains.
- `node scripts/check-intentos.mjs` completed with `IntentOS self-check passed`.
- `npm run verify` completed successfully.
- `git diff --check` reported no whitespace errors.

## Notes

`rg` scans for the literal string `FAIL` in the redirected verification log can
match expected fixture text and enum names. The command exit codes and final
`IntentOS self-check passed` / successful `npm run verify` result are the
authoritative validation signals for this release.
