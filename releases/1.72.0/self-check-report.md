# 1.72.0 Self-Check Report

## Scope

This self-check covers the Execution Assurance Chain release surface:

- documentation
- template
- schema
- checklist
- prompt
- resolver
- checker
- CLI wiring
- manifest wiring
- examples
- bad fixtures
- package verify wiring

## Expected Checks

```bash
node --check scripts/resolve-execution-assurance.mjs
node --check scripts/check-execution-assurance.mjs
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/feature-contract-validation --require-structured-evidence --require-evidence-refs --require-review --require-actual-diff --require-precise-evidence
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/old-project-intentos-adoption --require-structured-evidence --require-evidence-refs --require-review --require-actual-diff --require-precise-evidence
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/safe-copy-patch --require-structured-evidence --require-evidence-refs --require-actual-diff
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/patch-smell-backend-only --require-structured-evidence
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
git diff --check
```

## Boundary

This self-check does not approve target-project writes, implementation beyond recorded scope, commit, push, release, production, CI/hook mutation, secrets, migrations, provider actions, or project authority transfer.
