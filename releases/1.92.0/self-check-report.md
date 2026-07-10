# IntentOS 1.92.0 Self-Check Report

## Scope

- exact execution-plan replay;
- approval and readiness binding;
- target/source/manifest/project identity;
- receipt schema and current-target verification;
- rollback and unexpected-path behavior;
- installed workflow activation;
- Adoption Assurance receipt consumption;
- generated-project compatibility;
- repository manifest, product, claim, syntax, and full verification.

## Results

| Check | Result |
|---|---|
| Temporary-project exact replay | PASS |
| Strict Apply Receipt checker | PASS |
| Missing readiness fails closed | PASS |
| Receipt copied to another project rejected | PASS |
| Source drift after planning rejected | PASS |
| Post-apply target drift rejected | PASS |
| Existing AGENTS/PR governance remains human-only | PASS |
| New-project onboarding route remains active | PASS |
| `node scripts/check-intentos.mjs --mode full` | PASS |
| `npm run verify` | PASS |
| `npm run verify:syntax` | PASS |
| `node scripts/check-manifest.mjs` | PASS |
| `node scripts/check-product-baseline.mjs` | PASS |
| `node scripts/check-claim-control.mjs` | PASS |
| `git diff --check` | PASS |

## Boundary

This evidence validates IntentOS repository and synthetic runtime behavior. It
does not approve a real target-project apply, business implementation, release,
production, migration, secret, CI/hook, or project-owner decision.
