# IntentOS 1.80.1 Release Record

## Theme

Release Evidence Gate precision hardening.

## What Changed

1. `check-release-evidence-gate.mjs` now recomputes recorded source-chain
   artifact file digests and rejects stale or mismatched source digests.
2. Required release evidence now resolves concrete local artifacts when strict
   or ready checks run:
   - build / preview artifact
   - runtime smoke artifact
   - rollback evidence
   - monitoring evidence
   - platform recipe source
   - release handoff pack source
3. `--require-current-completion` now runs strict Completion Evidence Gate
   validation for the referenced completion report.
4. Web and mini-program release examples now include full completion-source
   chains instead of minimal placeholder Completion Evidence.
5. Added bad fixtures for source digest mismatch, build artifact digest
   mismatch, unresolved runtime smoke, and failing strict completion evidence.
6. Generated-project smoke now verifies that initialized projects can run
   `release-evidence` and `release-evidence-check` with strict source binding.
7. README and docs indexes now expose Release Evidence Gate as a first-class
   release-review evidence capability.

## Allowed Claims

- IntentOS can check whether local release-review evidence is precise enough
  for human release-owner review.
- IntentOS can reject release handoff when required local evidence refs do not
  resolve.
- IntentOS can reject source-chain or build artifact digest drift.
- IntentOS can require strict Completion Evidence validation before current
  completion is reused for release-review handoff.

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

## Known Limitations

- Release Evidence Gate validates local release-review evidence only; it does
  not prove that the deployed runtime, store review, mini-program review, or
  production environment is actually healthy.
- Strict source binding depends on referenced artifacts being present in the
  project workspace; unresolved external systems, provider dashboards, app-store
  portals, payment consoles, secrets managers, and DNS consoles remain human or
  external-system responsibilities.
- `--require-current-completion` delegates to the Completion Evidence checker
  for the referenced completion report, but it does not independently judge
  product correctness beyond the recorded source-chain evidence.
- Existing project release rules can be mapped and checked for local evidence
  conflicts, but IntentOS does not override stronger project SOPs or approve a
  migration to production release execution.

## Evidence Status

- Checker: `scripts/check-release-evidence-gate.mjs`.
- Self-check integration: `scripts/check-intentos.mjs`.
- Examples: `examples/1.80-release-evidence-gate/`.
- Bad fixtures: `test-fixtures/bad/bad-release-evidence-*`.

## Verification

Expected local verification:

```bash
node --check scripts/check-release-evidence-gate.mjs
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/web-preview-handoff --require-structured-evidence --require-current-completion --strict-source-binding
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/mini-program-review-handoff --require-structured-evidence --require-platform-recipe
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-source-digest-mismatch --report release-evidence-gate-reports/001-bad.md --require-structured-evidence --strict-source-binding
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-build-artifact-digest-mismatch --report release-evidence-gate-reports/001-bad.md --require-structured-evidence --strict-source-binding
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-runtime-smoke-unresolved --report release-evidence-gate-reports/001-bad.md --require-structured-evidence --strict-source-binding
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-completion-evidence-strict-check-fails --report release-evidence-gate-reports/001-bad.md --require-structured-evidence --require-current-completion --strict-source-binding
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify:governance
npm run verify:release
npm run verify:syntax
git diff --check
```

Bad fixture commands are expected to fail.

## Boundary

Release Evidence Gate remains a read-only review-evidence gate. It prepares
evidence for human review and never approves or executes release.
