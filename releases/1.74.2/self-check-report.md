# 1.74.2 Self-Check Report

## Scope

This self-check covers the 1.74.2 runtime naming and Execution Assurance plan
reference binding patch.

## Required Evidence

- Version metadata updated to `1.74.2`.
- Active runtime source-repository states and next actions use `INTENTOS_*`
  vocabulary.
- Naming hardcut rejects active `DEV_KIT` runtime tokens.
- Execution Assurance strict/precise checks resolve `execution_plan.plan_ref`
  before allowing `VERIFIED_DONE`.
- Bad fixture coverage includes unresolved execution plan references.
- Generated-project smoke writes and checks the same Execution Assurance report.
- Release evidence is present under `releases/1.74.2/`.

## Commands

```bash
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
npm run verify
git diff --check
```

## Expected Result

All checks pass. Any failure in runtime naming hardcut, plan-ref resolution,
generated-project smoke, manifest coverage, positive examples, bad fixtures, or
Execution Assurance strict examples blocks the release.

## Boundary

This self-check does not approve real project implementation, target-project
writes, commit, push, release, production, CI/hook mutation, secrets,
migrations, provider actions, or high-risk business decisions.
