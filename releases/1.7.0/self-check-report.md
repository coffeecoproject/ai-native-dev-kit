# 1.7.0 Self-check Report

## Human Summary

This report records the expected self-check surface for First Delivery Walkthrough.

## Checks

| Area | Command | Expected |
|---|---|---|
| Syntax | `node --check scripts/check-first-delivery-walkthrough.mjs` | PASS |
| Source repo | `node scripts/check-first-delivery-walkthrough.mjs .` | PASS |
| Walkthrough example | `node scripts/check-first-delivery-walkthrough.mjs examples/1.7-first-delivery-walkthrough` | PASS |
| Bad missing final | `node scripts/check-first-delivery-walkthrough.mjs test-fixtures/bad/bad-first-delivery-missing-final` | FAIL as expected |
| Bad missing launch | `node scripts/check-first-delivery-walkthrough.mjs test-fixtures/bad/bad-first-delivery-missing-launch` | FAIL as expected |
| Bad overclaim | `node scripts/check-first-delivery-walkthrough.mjs test-fixtures/bad/bad-first-delivery-overclaim` | FAIL as expected |
| 170 workflow artifacts | `node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/170-first-delivery-walkthrough.md` | PASS |
| 170 review loop | `node scripts/check-review-loop.mjs . --task tasks/170-first-delivery-walkthrough.md` | PASS |
| 170 next-step boundary | `node scripts/check-next-step-boundary.mjs . --task tasks/170-first-delivery-walkthrough.md` | PASS |
| Manifest | `node scripts/check-manifest.mjs` | PASS |
| Fixtures | `node scripts/check-fixtures.mjs` | PASS |
| Claim control | `node scripts/check-claim-control.mjs .` | PASS |
| Full IntentOS | `node scripts/check-intentos.mjs` | PASS |

## Notes

`1.7.0` does not claim real-project production validation. The included example is simulated walkthrough evidence only.
