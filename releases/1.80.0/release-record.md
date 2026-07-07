# IntentOS 1.80.0 Release Record

## Theme

Release Evidence Gate.

## What Changed

1. Added `release-evidence` and `release-evidence-check`.
2. Added structured `release_evidence_gate` evidence schema.
3. Added Release Evidence Gate docs, core model, template, checklist, prompt,
   report directory, and release-candidate directory.
4. Release evidence now records release candidate identity, release target,
   included Completion Evidence refs, source revision, build artifact, source
   chain, target-specific evidence requirements, runtime smoke, rollback,
   monitoring, environment/config, data/migration, cost/quota, and existing
   project release SOP mapping.
5. Positive examples cover web preview handoff and mini-program review handoff.
6. A blocked production-review example proves missing release owner, rollback,
   monitoring, incident owner, migration decision, and source cleanliness do
   not pass as ready.
7. Bad fixtures reject release-approved claims, missing release owner, missing
   production rollback, and user-note-only runtime smoke.

## Allowed Claims

- IntentOS can prepare a read-only release-review evidence package.
- IntentOS can say whether a release candidate can be handed to a human release
  owner for formal review.
- IntentOS can block release-review handoff when target-specific evidence is
  missing.
- IntentOS can map existing project release SOPs without downgrading them.

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

- Schema: `schemas/artifacts/release-evidence-gate.schema.json`.
- Resolver: `scripts/resolve-release-evidence-gate.mjs`.
- Checker: `scripts/check-release-evidence-gate.mjs`.
- CLI aliases: `release-evidence`, `release-evidence-check`.
- Examples: `examples/1.80-release-evidence-gate/`.
- Bad fixtures: `test-fixtures/bad/bad-release-evidence-*`.

## Known Limitations

- See `releases/1.80.0/known-limitations.md`.
- Release Evidence Gate checks release-review readiness, not production truth.
- Source binding is local-file based; external release systems remain outside
  IntentOS authority.
- Human release approval remains an external decision record and is not granted
  by this gate.

## Verification

Expected local verification:

```bash
node --check scripts/resolve-release-evidence-gate.mjs
node --check scripts/check-release-evidence-gate.mjs
node scripts/cli.mjs release-evidence . --intent "prepare release review"
node scripts/cli.mjs release-evidence-check . --allow-empty
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/web-preview-handoff --require-structured-evidence --require-current-completion --strict-source-binding
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/mini-program-review-handoff --require-structured-evidence --require-platform-recipe
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/admin-production-review-blocked --require-structured-evidence
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-release-approved-claim --require-structured-evidence
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-no-release-owner --require-structured-evidence
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-missing-rollback-production --require-structured-evidence
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-user-note-treated-as-smoke --require-structured-evidence
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Bad fixture commands are expected to fail.

## Boundary

Release Evidence Gate is an evidence handoff gate only. It prepares review
evidence for a human release owner and never approves or executes release.
