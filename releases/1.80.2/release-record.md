# IntentOS 1.80.2 Release Record

## Theme

Release Evidence Runtime Digest And Markdown Consistency.

## Summary

`1.80.2` closes the remaining Release Evidence Gate precision gaps after
`1.80.1`. Runtime smoke, rollback, and monitoring evidence now carry digest
fields, and strict checks recompute those digests from resolved artifacts when
the evidence is required. Release Evidence reports also cross-check key
human-readable Markdown tables against the machine-readable JSON evidence block.

This is a hardening release. It does not introduce a new release authority,
deployment executor, app-store submission tool, migration runner, CI mutator,
secret collector, or real-user stability proof.

## Changes

- Added `runtime_readiness.runtime_smoke_digest`.
- Added `rollback_readiness.rollback_digest`.
- Added `monitoring_readiness.monitoring_digest`.
- Updated `resolve-release-evidence-gate.mjs` to populate those digests from
  resolved artifact refs when available.
- Updated `check-release-evidence-gate.mjs` so required runtime smoke,
  rollback, and monitoring artifacts must resolve and match their recorded
  digests.
- Added Markdown/JSON consistency checks for Release Scope, Release Target
  Requirements, Source Chain, Owner And Approval, Environment Readiness,
  Runtime And Rollback, Data Migration And Cost, and Missing Evidence.
- Added a current-release cross-check requiring recorded current Completion
  Evidence to appear in `release_scope.included_completion_evidence_refs`.
- Added bad fixtures for runtime smoke digest mismatch and Markdown/JSON drift.
- Updated README capability tables to expose Release Evidence Gate as a
  first-class capability.

## Allowed Claims

- IntentOS can check whether required runtime smoke, rollback, and monitoring
  artifacts resolve and match their recorded digests.
- IntentOS can reject Release Evidence reports where key Markdown tables drift
  from the machine-readable JSON evidence.
- IntentOS can reject release-review handoff when recorded current Completion
  Evidence is not included in the release scope.
- IntentOS can prepare a more precise local release-review evidence package for
  a human release owner.

## Forbidden Claims

- This release does not approve release or production.
- This release does not deploy.
- This release does not submit app-store or mini-program review.
- This release does not execute migrations.
- This release does not ask for, record, or use secrets.
- This release does not change DNS, payment providers, CI/CD, hooks, provider
  state, or production config.
- This release does not make Codex the release owner.
- This release does not prove real-user stability.

## Evidence Status

- Checker: `scripts/check-release-evidence-gate.mjs`.
- Resolver: `scripts/resolve-release-evidence-gate.mjs`.
- Schema: `schemas/artifacts/release-evidence-gate.schema.json`.
- Examples: `examples/1.80-release-evidence-gate/`.
- Bad fixtures:
  `test-fixtures/bad/bad-release-evidence-runtime-smoke-digest-mismatch/` and
  `test-fixtures/bad/bad-release-evidence-markdown-json-mismatch/`.
- Self-check integration: `scripts/check-intentos.mjs`.

## Verification

Expected local verification:

```bash
node --check scripts/resolve-release-evidence-gate.mjs
node --check scripts/check-release-evidence-gate.mjs
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/web-preview-handoff --require-structured-evidence --require-current-completion --strict-source-binding
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/mini-program-review-handoff --require-structured-evidence --require-platform-recipe
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-runtime-smoke-digest-mismatch --require-structured-evidence --strict-source-binding
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-markdown-json-mismatch --require-structured-evidence --strict-source-binding
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

The two bad-fixture commands are expected to fail with precise errors.

## Known Limitations

See [known-limitations.md](known-limitations.md).

- Release Evidence Gate validates local release-review evidence only.
- Digest validation proves a referenced artifact matches the report, not that a
  human release owner should approve the release.
- Markdown/JSON consistency improves report trust, but does not replace release
  owner judgment or external platform review.

## Boundary

`1.80.2` remains a release-review evidence gate. It does not approve release,
deploy production, submit to app-store or mini-program review, execute
migrations, record secrets, change DNS/payment/provider/CI, approve external
system actions, replace the human release owner, or prove real-user stability.
