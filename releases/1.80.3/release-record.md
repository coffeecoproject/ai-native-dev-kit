# IntentOS 1.80.3 Release Record

## Theme

Release Owner And Completion Set Binding.

## Summary

`1.80.3` hardens Release Evidence Gate after `1.80.2` by closing two
release-review gaps:

- a release candidate may include more than one Completion Evidence report, so
  strict checks must validate every included report instead of only the first;
- release owner, risk owner, environment owner, and release approval posture
  must be structured evidence, not prose-only report text.

This remains a release-review evidence package for a human release owner. It
does not approve release, deploy, submit app-store or mini-program review,
execute migrations, record secrets, mutate CI, or prove real-user stability.

## Changes

- Added `completion_evidence_set` to Release Evidence Gate structured evidence.
- Added `owner_readiness` to Release Evidence Gate structured evidence.
- Updated `resolve-release-evidence-gate.mjs` to resolve every included
  Completion Evidence ref, record its digest, task ref, intent digest,
  completion state, claim flag, release-scope membership, and strict-check
  result.
- Updated `check-release-evidence-gate.mjs` so ready or strict release-review
  reports must validate every included Completion Evidence item.
- Required every included Completion Evidence task ref to belong to
  `release_scope.included_task_refs`.
- Required production-like targets to record concrete release owner, risk
  owner, and environment owner refs before ready handoff.
- Rejected release approval refs that imply release has already been approved.
- Added Markdown/JSON consistency checks for Completion Evidence Set and owner
  readiness rows.
- Regenerated 1.80 positive examples and added bad fixtures for unchecked
  second completion evidence, task scope drift, missing production risk owner,
  and invalid approval refs.

## Allowed Claims

- IntentOS can check every Completion Evidence report included in a release
  candidate.
- IntentOS can reject release-review handoff when a completion task is outside
  the release scope.
- IntentOS can require structured release, risk, and environment owner
  readiness for production-like handoff.
- IntentOS can reject release-review evidence that tries to encode release
  approval as if the release had already been approved.

## Forbidden Claims

- This release does not approve release or production.
- This release does not deploy.
- This release does not submit app-store or mini-program review.
- This release does not execute migrations.
- This release does not ask for, record, or use secrets.
- This release does not change DNS, payment providers, CI/CD, hooks, provider
  state, or production config.
- This release does not make Codex the release owner, risk owner, environment
  owner, or release approver.
- This release does not prove real-user stability.

## Evidence Status

- Checker: `scripts/check-release-evidence-gate.mjs`.
- Resolver: `scripts/resolve-release-evidence-gate.mjs`.
- Schema: `schemas/artifacts/release-evidence-gate.schema.json`.
- Examples: `examples/1.80-release-evidence-gate/`.
- Bad fixtures:
  - `test-fixtures/bad/bad-release-evidence-second-completion-unchecked/`
  - `test-fixtures/bad/bad-release-evidence-completion-task-not-in-release-scope/`
  - `test-fixtures/bad/bad-release-evidence-production-without-risk-owner-ref/`
  - `test-fixtures/bad/bad-release-evidence-approval-ref-implies-release-approved/`
- Self-check integration: `scripts/check-intentos.mjs`.

## Verification

Expected local verification:

```bash
node --check scripts/resolve-release-evidence-gate.mjs
node --check scripts/check-release-evidence-gate.mjs
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/web-preview-handoff --require-structured-evidence --require-current-completion --strict-source-binding
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/mini-program-review-handoff --require-structured-evidence --require-platform-recipe
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/admin-production-review-blocked --require-structured-evidence
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-second-completion-unchecked --report release-evidence-gate-reports/001-web-preview.md --require-structured-evidence --strict-source-binding
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-completion-task-not-in-release-scope --report release-evidence-gate-reports/001-web-preview.md --require-structured-evidence --strict-source-binding
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-production-without-risk-owner-ref --report release-evidence-gate-reports/001-mini-program-review.md --require-structured-evidence --require-platform-recipe
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-approval-ref-implies-release-approved --report release-evidence-gate-reports/001-web-preview.md --require-structured-evidence
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

The four bad-fixture commands are expected to fail with targeted errors.

## Known Limitations

See [known-limitations.md](known-limitations.md).

- Release Evidence Gate validates local release-review evidence only.
- Completion Evidence strict checks prove recorded evidence consistency, not
  product correctness in production.
- Owner readiness proves the release-review packet has explicit owners, not
  that those owners have approved the release.

## Boundary

`1.80.3` remains a release-review evidence gate. It does not approve release,
deploy production, submit to app-store or mini-program review, execute
migrations, record secrets, change DNS/payment/provider/CI, approve external
system actions, replace the human release owner, or prove real-user stability.
