# IntentOS 1.86.0 Self-Check Report

## Scope

This self-check covers Execution And Release Runtime Hygiene.

## Checked Areas

- Runtime Hygiene core, docs, template, schema, checklist, prompt, and reports
  directory.
- `runtime-hygiene` and `runtime-hygiene-check` CLI commands.
- Positive examples for Git lineage, pre-push gate failure, CI environment
  retry, artifact quota, and release bundle bloat.
- Bad fixtures for force push, gate bypass, false done claim, artifact
  deletion, evidence deletion, release ID reuse after production side effect,
  unknown production side effect, bundle slimming by deleting evidence, and
  technical user burden.
- Manifest, workflow-version assets, and release entry consistency.

## Verification Commands

```bash
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/git-old-branch-rebase-plan --require-structured-evidence
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/pre-push-structure-gate --require-structured-evidence
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/ci-environment-retry --require-structured-evidence
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/release-artifact-quota-preflight --require-structured-evidence
node scripts/check-runtime-hygiene.mjs examples/1.86-runtime-hygiene/release-bundle-evidence-bloat --require-structured-evidence
node scripts/cli.mjs runtime-hygiene . --intent "push current task"
node scripts/cli.mjs runtime-hygiene-check . --allow-empty
node scripts/check-runtime-hygiene.mjs . --allow-empty
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify:syntax
npm run verify:examples
npm run verify:release
git diff --check
```

## Result

PASS. Local verification completed.

The first full `check-intentos` pass exposed two integration gaps before this
record was finalized:

- the 1.86 release record needed a meaningful `Known Limitations` section;
- generated projects needed root-level Runtime Hygiene resolver/checker copy
  rules, not only `.intentos` documentation assets.

Both gaps were corrected. The Runtime Hygiene examples, bad fixtures, manifest
copy rules, generated-project workflow update path, claim-control checks,
product-baseline checks, and full IntentOS self-check now pass.
