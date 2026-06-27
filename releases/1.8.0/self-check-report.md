# Self-check Report: 1.8.0

## Human Summary

Full 1.8.0 verification passed after adding real-project read-only adoption, existing-governance mapping, and patch classification governance.

## Commands

```text
node --check scripts/check-real-adoption-trial.mjs
node --check scripts/check-patch-classification.mjs
node --check scripts/check-dev-kit.mjs
node scripts/check-real-adoption-trial.mjs .
node scripts/check-patch-classification.mjs .
node scripts/check-real-adoption-trial.mjs examples/1.8-real-project-readonly
node scripts/check-patch-classification.mjs examples/1.8-real-project-readonly
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-context-governance.mjs .
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/180-real-project-adoption-trial.md
node scripts/check-review-loop.mjs . --task tasks/180-real-project-adoption-trial.md
node scripts/check-next-step-boundary.mjs . --task tasks/180-real-project-adoption-trial.md
node scripts/check-dev-kit.mjs
git diff --check
```

## Result

PASS

## Scope Verified

- Real adoption trial protocol and checker.
- Patch classification protocol and checker.
- Sanitized source evidence and example evidence.
- Bad fixture rejection paths.
- Manifest, CLI, CI, platform adapters, references, and release evidence.
- Workflow artifacts and review loop for task 180.

## Boundaries

- No target project write was performed.
- No private target project identity is published.
- No production validation or approval is claimed.
- No external GPT/API automation is introduced.

## Residual Risk

Additional private trials are still needed across more platforms and governance maturity levels.
