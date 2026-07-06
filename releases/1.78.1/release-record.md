# IntentOS 1.78.1 Release Record

## Theme

Completion Evidence Source Chain Binding.

## Summary

1.78.1 tightens the Completion Evidence Gate introduced in 1.78.0.

1.78.0 checked that Business Rule Closure, Verification Plan, Test Evidence,
and Execution Assurance were recorded, ready, and bound to the same task.

1.78.1 adds stricter source-chain validation:

```text
Business Rule Closure
-> Verification Plan
-> Test Evidence
-> Execution Assurance
-> Completion Evidence Gate
```

The gate now rejects same-task ready reports when they do not actually point to
each other.

## Added Or Changed

- `check-completion-evidence.mjs` now validates source schemas under strict
  source-ref / ready checks.
- Completion Evidence strict checks now compare source task refs, outcomes,
  source digests, and source intent digests.
- Completion Evidence strict checks now verify:
  - Verification Plan references the same Business Rule Closure;
  - Test Evidence references the same Verification Plan;
  - Execution Assurance references the same Test Evidence.
- `resolve-completion-evidence.mjs` now emits source intent digests and added
  gate checks for source digest consistency, intent consistency, and source
  chain binding.
- Completion Evidence docs, template, checker reference, script reference, and
  artifact reference now expose the final completion gate.
- New bad fixtures cover broken BRC / Verification Plan / Test Evidence /
  Execution Assurance chains, digest mismatch, invalid source schema, and intent
  digest mismatch.

## Allowed Claims

- IntentOS can check whether a recorded Completion Evidence Gate report binds
  BRC, Verification Plan, Test Evidence, and Execution Assurance into one source
  chain.
- IntentOS can reject completion claims with mismatched source refs, digests,
  intent digests, source schemas, or upstream outcomes.
- IntentOS can say the completion evidence chain is ready when the recorded
  strict checks pass.

## Forbidden Claims

- This release does not run tests.
- This release does not write target-project files.
- This release does not approve implementation, commit, push, release,
  production, deployment, migration, provider action, or customer rollout.
- This release does not prove product correctness or real-environment behavior.
- This release does not replace Business Rule Closure, Verification Plan, Test
  Evidence, Execution Assurance, Review Loop, Safe Launch, or human approval.

## Evidence Status

- Source-chain binding is checked from recorded local artifacts.
- Source schemas are validated using the local artifact schemas available to
  IntentOS.
- Execution Assurance intent binding is indirect: it is checked through
  `task_ref`, `source_systems`, and Test Evidence refs because the current
  Execution Assurance artifact does not expose a top-level `intent_digest`.

## Known Limitations

- Completion Evidence Gate still depends on upstream source artifacts being
  generated honestly and checked by their own validators.
- It does not execute verification commands or inspect production systems.
- It cannot prove that all possible business impacts were discovered.

## Verification

Expected local verification:

```bash
node --check scripts/resolve-completion-evidence.mjs
node --check scripts/check-completion-evidence.mjs
node scripts/check-completion-evidence.mjs examples/1.78-completion-evidence-gate/appointment-service-time --report completion-evidence-reports/001-service-time.md --require-structured-evidence --require-source-refs --require-ready
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

Additional negative evidence is covered by the `bad-completion-evidence-*`
fixtures. These fixtures must fail when the BRC -> Verification Plan -> Test
Evidence -> Execution Assurance chain is broken, when source schemas are
invalid, when source digests are stale, or when source intent digests do not
match the Completion Evidence task.
