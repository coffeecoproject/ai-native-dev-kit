# IntentOS 1.93.0 Self-Check Report

## Scope

- structured human Release Approval Record authority;
- project, Git revision, target, candidate, package, and source-report binding;
- strict upstream checker replay;
- Release Execution consumer hardcut;
- candidate and project drift invalidation;
- generated-project workflow installation and onboarding behavior;
- repository schema, manifest, product, claim, syntax, and full verification.

## Results

| Check | Result |
|---|---|
| Current project-bound approval | PASS |
| Strict Release Evidence Gate replay | PASS |
| Strict Runtime Hygiene replay | PASS |
| Strict Release Channel Policy replay | PASS |
| Required platform recipe/handoff binding | PASS |
| Trusted bounded Release Execution | PASS |
| Empty strict approval fails closed | PASS |
| Plain text / CLI approval rejected | PASS |
| Copied approval rejected | PASS |
| Candidate drift rejected | PASS |
| Git revision drift rejected | PASS |
| High-risk Codex actions rejected | PASS |
| Generated-project onboarding route | PASS |
| `node scripts/check-intentos.mjs --mode full` | PASS |
| `npm run verify` | PASS |
| `npm run verify:syntax` | PASS |
| `node scripts/check-manifest.mjs` | PASS |
| `node scripts/check-product-baseline.mjs` | PASS |
| `node scripts/check-claim-control.mjs` | PASS |
| `git diff --check` | PASS |

## Boundary

This evidence validates IntentOS repository and synthetic release-trust
behavior. It does not approve a real release, production action, provider
operation, migration, secret, compliance decision, or project-owner decision.
