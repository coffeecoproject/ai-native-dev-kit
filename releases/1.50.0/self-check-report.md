# IntentOS 1.50.0 Self-Check Report

## Scope

This self-check covers evidence reference resolution, git diff changed-file input, strict Execution Closure impact linking, examples, bad fixtures, and release documentation.

## Required Checks

- `scripts/check-change-impact-coverage.mjs` supports `--resolve-evidence-refs`.
- `scripts/resolve-change-impact-coverage.mjs` supports `--from-git-diff`, `--cached`, and `--base`.
- `scripts/check-execution-closure.mjs` supports `--require-impact-coverage`.
- The 1.49 structured example passes strict closure with evidence reference resolution.
- The linked Execution Closure example passes strict impact coverage requirements.
- Bad fixtures reject missing evidence references and missing impact coverage links.
- README, VERSION, package, manifest, docs, and release records point to 1.50.0.

## Result

Passed in local release verification.

## Evidence

- `node --check scripts/resolve-change-impact-coverage.mjs`
- `node --check scripts/check-change-impact-coverage.mjs`
- `node --check scripts/check-execution-closure.mjs`
- `node scripts/check-change-impact-coverage.mjs examples/1.49-structured-impact-coverage/contract-input-rule --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs`
- `node scripts/check-execution-closure.mjs examples/1.49-structured-impact-coverage/contract-input-rule --require-impact-coverage`
- `node scripts/check-manifest.mjs`
- `node scripts/check-fixtures.mjs`
- `node scripts/check-intentos.mjs`

## Boundaries

- This report does not approve implementation.
- This report does not approve commit or push.
- This report does not approve release or production.
- This report does not replace external review.
