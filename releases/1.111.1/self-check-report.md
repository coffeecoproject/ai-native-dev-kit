# IntentOS 1.111.1 Self-Check Report

## Status

PASS.

The final candidate passed the focused responsibility checks, generated-project
distribution checks, strict Manifest validation, IntentOS repository self-check,
release/distribution verification, and full repository verification.

## Required Verification

The release candidate must pass:

```bash
node scripts/check-review-context-authority.mjs .
node --test tests/review-context-authority.test.mjs tests/active-guidance-distribution-closeout.test.mjs
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Generated-project acceptance must prove that installed workflow, mental-model,
Goal Card, Agent, and runtime guidance preserve the current responsibility
contract.

## Observed Results

| Verification | Result |
|---|---|
| Review Context Authority | PASS |
| Responsibility semantic tests | 16 passed, 0 failed |
| Generated Goal Card responsibility regression | PASS |
| Controlled Apply Readiness compatibility | PASS |
| Strict Manifest validation | PASS |
| IntentOS repository self-check | PASS |
| Release and generated-project verification | PASS |
| Full `npm run verify` | PASS |
| `git diff --check` | PASS |

The full verification chain initially exposed two release-document consistency
gaps: the project version-record template still named `1.111.0`, and the
compatibility term `Risk Gate Exclusions` was absent from current documentation
references. Both were corrected before the final successful run.

## Boundary

Passing these checks does not authorize project writes, apply, release,
production, external effects, or absolute correctness claims.
