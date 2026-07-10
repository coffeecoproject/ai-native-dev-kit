# Release 1.91.0 Self-Check Report

## Scope

Evidence Authority Core.

## Required Checks

- Generated Verification Plan source chain passes strict authority validation.
- A target-project schema shadow cannot weaken the active IntentOS schema.
- A stale raw source digest is rejected.
- A task-mismatched binding is rejected.
- A symbolic-link evidence escape is rejected.

## Boundaries

- No implementation, apply, commit, push, release, production, migration,
  provider, or project-owner authorization is added.
- Authority validation proves source identity only, not product correctness.

## Final Verification

Executed before release:

```bash
node scripts/check-intentos.mjs --mode full
npm run verify
git diff --check
```

Result:

- `node scripts/check-intentos.mjs --mode full`: PASS
- `npm run verify`: PASS
- `git diff --check`: PASS
