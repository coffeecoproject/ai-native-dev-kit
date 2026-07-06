# IntentOS 1.78.3 Release Record

## Theme

Completion Evidence Reference Docs And Compatibility Notes.

## Summary

1.78.3 is a narrow documentation and compatibility-notes patch for the 1.78
Completion Evidence line.

1.78.2 tightened the strict contract by requiring
`source_chain[].intent_digest` and top-level Execution Assurance
`intent_digest`. 1.78.3 documents how maintainers and Codex should use that
contract:

- reference docs expose `completion-evidence` and `completion-evidence-check`
  in the public CLI/checker/artifact surface;
- 1.78.0 / 1.78.1 Completion Evidence reports used with 1.78.2+ strict checks
  must include `source_chain[].intent_digest`;
- Execution Assurance reports used as strict Completion Evidence sources must
  include top-level `intent_digest`;
- strict completion chains should reuse one canonical task intent across
  Business Rule Closure, Verification Plan, Test Evidence, Execution Assurance,
  and Completion Evidence.

This release does not add a new workflow layer or change release/production
authority.

## Added Or Changed

- `docs/reference/scripts.md` now lists the Completion Evidence CLI commands in
  the main front-door table and documents strict-chain compatibility.
- `docs/reference/checkers.md` now describes the 1.78.2+ intent-field
  compatibility requirement for Completion Evidence checks.
- `docs/reference/artifacts.md` now lists the `completion_evidence_gate`
  structured evidence contract and compatibility notes.
- `docs/completion-evidence-gate.md` and `docs/structured-evidence-schema.md`
  now document canonical intent usage across the strict completion chain.
- README, Chinese README, version record, manifest, package metadata, and
  workflow-version template now point to 1.78.3.

## Allowed Claims

- IntentOS documents how to use the stricter 1.78.2 Completion Evidence intent
  contract.
- IntentOS reference docs expose the Completion Evidence CLI, checker, and
  artifact surfaces.
- IntentOS can say older 1.78.0 / 1.78.1 reports need regeneration or patching
  before passing 1.78.2+ strict completion checks.

## Forbidden Claims

- This release does not change checker authority.
- This release does not add a new gate or workflow layer.
- This release does not run tests.
- This release does not write target-project files.
- This release does not approve implementation, commit, push, release,
  production, deployment, migration, provider action, or customer rollout.
- This release does not prove product correctness or real-environment behavior.

## Evidence Status

- The 1.78.2 strict-chain behavior remains the implementation baseline.
- 1.78.3 adds documentation and compatibility clarity only.
- Validation is recorded in `releases/1.78.3/self-check-report.md`.

## Known Limitations

- See `releases/1.78.3/known-limitations.md`.

## Verification

Expected local verification:

```bash
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-intentos.mjs
npm run verify
git diff --check
```
