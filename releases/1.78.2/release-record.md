# IntentOS 1.78.2 Release Record

## Theme

Completion Evidence Reference And Intent Contract Sync.

## Summary

1.78.2 is a narrow contract-polishing patch for the 1.78 Completion Evidence
Gate line.

1.78.1 made Completion Evidence check source-chain refs, source schemas, source
digests, and source intent digests. 1.78.2 closes the remaining contract gap:

- `source_chain[].intent_digest` is now required by the Completion Evidence
  schema contract;
- Execution Assurance reports now expose top-level `intent_digest`;
- Completion Evidence checks Execution Assurance intent directly instead of
  relying only on task refs and `source_systems`.

The chain remains:

```text
Business Rule Closure
-> Verification Plan
-> Test Evidence
-> Execution Assurance
-> Completion Evidence Gate
```

## Added Or Changed

- `schemas/artifacts/completion-evidence.schema.json` requires
  `source_chain[].intent_digest`.
- `schemas/artifacts/execution-assurance.schema.json` requires top-level
  `intent_digest`.
- `resolve-execution-assurance.mjs` emits top-level `intent_digest`.
- `check-execution-assurance.mjs` validates that top-level `intent_digest`
  matches `intent_lock.user_intent`.
- `check-completion-evidence.mjs` validates Execution Assurance intent digest
  directly under strict source-ref / ready checks.
- README capability tables now list Completion Evidence Gate as a first-class
  capability.

## Allowed Claims

- IntentOS can require every Completion Evidence source-chain item to carry an
  intent digest.
- IntentOS can require Execution Assurance to expose a top-level intent digest.
- IntentOS can reject completion claims when Execution Assurance intent does not
  match the Completion Evidence task intent.

## Forbidden Claims

- This release does not run tests.
- This release does not write target-project files.
- This release does not approve implementation, commit, push, release,
  production, deployment, migration, provider action, or customer rollout.
- This release does not prove product correctness or real-environment behavior.
- This release does not replace Business Rule Closure, Verification Plan, Test
  Evidence, Execution Assurance, Review Loop, Safe Launch, or human approval.

## Evidence Status

- Positive Completion Evidence examples now include direct Execution Assurance
  intent binding.
- Existing Completion Evidence bad fixtures are preserved and updated to the
  stricter source-chain schema contract.
- A dedicated `bad-completion-evidence-ea-intent-digest-mismatch` fixture now
  proves Completion Evidence rejects a referenced Execution Assurance report
  with the wrong top-level intent digest.
- Existing Execution Assurance examples and fixtures now expose top-level
  `intent_digest` in machine-readable evidence.

## Known Limitations

- Completion Evidence Gate still depends on upstream source artifacts being
  generated honestly and checked by their own validators.
- It does not execute verification commands or inspect production systems.
- A matching intent digest does not prove product correctness, only that the
  recorded evidence chain is bound to the same stated task intent.

## Verification

Expected local verification:

```bash
node --check scripts/resolve-execution-assurance.mjs
node --check scripts/check-execution-assurance.mjs
node --check scripts/resolve-completion-evidence.mjs
node --check scripts/check-completion-evidence.mjs
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/feature-contract-validation --require-structured-evidence --require-evidence-refs --require-review --require-actual-diff --require-precise-evidence
node scripts/check-completion-evidence.mjs examples/1.78-completion-evidence-gate/appointment-service-time --report completion-evidence-reports/001-service-time.md --require-structured-evidence --require-source-refs --require-ready
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```
