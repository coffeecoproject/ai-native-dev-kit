# 1.67.1 Self-Check Report

## Status

Passed.

## Verified Checks

- `node --check scripts/check-release-plan.mjs`
- `node --check scripts/workflow-next.mjs`
- `node --check scripts/start-project.mjs`
- `node scripts/check-release-plan.mjs examples/1.67-release-core-model/web-preview --require-structured-evidence`
- `node scripts/check-release-plan.mjs examples/1.67-release-core-model/mini-program-review --require-structured-evidence`
- `node scripts/check-release-plan.mjs examples/1.67-release-core-model/backend-api-handoff --require-structured-evidence`
- `node scripts/check-release-plan.mjs examples/1.67-release-core-model/governed-existing-project-readonly --require-structured-evidence`
- `node scripts/check-release-plan.mjs .`
- `node scripts/check-manifest.mjs`
- `npm --silent run verify:examples`
- `npm --silent run verify:governance`
- `node scripts/check-dev-kit.mjs`
- Optional local governed-project smoke: `start` / `next` against a private production-sensitive project checkout. This was local calibration evidence only, with the private path omitted from public required verification.
- `node scripts/cli.mjs claim-control .`
- `node scripts/cli.mjs product-baseline .`
- `node scripts/check-claim-control.mjs .`
- `git diff --check`

## Result

Pass. The 1.67.1 release plan hardening rejects the expanded unsafe cases, the positive examples pass strict structured evidence checks, and the optional local governed-project smoke check reports IntentOS Operating Mode as active while keeping project asset migration adapter-only until Native Migration and Existing Rule Reconciliation are reviewed and approved.
