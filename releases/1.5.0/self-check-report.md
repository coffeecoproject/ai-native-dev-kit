# Self-check Report 1.5.0

## Human Summary

Safe Launch assets, checker, example, and bad fixtures are present.

## Checks

| Check | Command / Evidence | Result |
|---|---|---|
| Syntax | `node --check scripts/check-launch-readiness.mjs` | PASS |
| Source repo | `node scripts/check-launch-readiness.mjs .` | PASS after final run |
| Good example | `node scripts/check-launch-readiness.mjs examples/1.5-safe-launch-readiness` | PASS |
| Bad missing verification | `test-fixtures/bad/bad-launch-readiness-missing-verification` | FAIL as expected |
| Bad pending decision | `test-fixtures/bad/bad-launch-readiness-unclosed-decision` | FAIL as expected |
| Bad overclaim | `test-fixtures/bad/bad-launch-readiness-overclaim` | FAIL as expected |

## Remaining Risk

Real launch safety depends on project evidence and human approval. This release only verifies the workflow layer.
