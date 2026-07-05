# Eval 140: Project Memory & Context Governance

## Human Summary

The phase passes when project memory assets are complete, generated projects receive them, and bad fixtures fail for the intended reasons.

## Checks

```bash
node scripts/check-context-governance.mjs .
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
git diff --check
```

## Acceptance

- Context governance checker passes this repo.
- Bad fixtures fail for approved candidate without evidence, missing correction evidence, and secret-like Git boundary misuse.
- Generated project context governance check passes.
- CLI exposes `context-governance`.
- CI runs context governance checks.
- Release record includes allowed claims, forbidden claims, evidence status, known limitations, and verification.

