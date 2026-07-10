# Release 1.91.0: Evidence Authority Core

## Summary

1.91 turns local evidence references into verifiable project/task facts.
Strict consumers now recompute project identity and file digests rather than
trusting a report's repeated source digest.

## Changed Assets

- Shared `scripts/lib/evidence-authority.mjs` identity and safe-reference layer.
- Authoritative artifact-schema loading for execution evidence schemas.
- Strict `--require-evidence-authority` modes for Verification Plan, Test
  Evidence, Execution Assurance, and Completion Evidence.
- Resolver-generated authority bindings for persisted Verification Plan and
  Test Evidence reports.
- Schema, documentation, checklist, prompt, self-check, and version updates.

## Allowed Claims

- Strict evidence rejects project-external, traversal, and symlinked local file
  references.
- Strict evidence verifies the current project identity, source revision, task
  ref, intent digest, and raw digest of consumed local files.
- Target-project schema copies cannot silently override IntentOS artifact
  schemas used by strict consumers.

## Forbidden Claims

- 1.91 does not prove product correctness or real-environment behavior.
- 1.91 does not approve implementation, apply, commit, push, release,
  production, tests, migrations, provider actions, or owner decisions.
- Authority binding is not a replacement for project-native gates or approvals.

## Evidence Status

- The self-check creates a temporary project-local authority chain and verifies
  it in strict mode.
- Negative paths cover target-schema shadowing, stale raw digests,
  task-mismatched bindings, and evidence symlink escape.
- This release records evidence identity only; it does not turn a successful
  command or report into product-correctness proof.

## Known Limitations

- Authority validation cannot decide whether a selected command or manual
  verification was semantically sufficient for the requested behavior.
- Historical reports stay readable but need a current authority binding before
  they can support a strict ready/done claim.

## Verification

```bash
node scripts/check-intentos.mjs --mode full
npm run verify
git diff --check
```

See [self-check-report.md](self-check-report.md) for the executed result.
