# Release 1.89.1 Self-Check Report

## Scope

Adoption Assurance Apply Binding Hardening.

## Checks

- Shared apply-chain helper syntax is checked by `verify:syntax`.
- Adoption Assurance resolver no longer treats apply-chain file presence alone
  as verified evidence.
- Adoption Assurance strict mode fails closed when no reports exist.
- Adoption Assurance `--allow-empty` remains an explicit maintainer override.
- `init-project --apply-plan` requires a structured approval record.
- Approval records must match plan digest, executable action IDs, and target
  paths before apply can proceed.
- Existing self-check apply-plan scenarios generate approval records instead of
  applying unbound plans.

## Boundaries

- No implementation authorization added.
- No native apply authorization added by this patch alone.
- No release or production authorization added.
- No project-owner decision replacement added.

## Final Verification

Completed in this working tree:

```bash
node scripts/check-intentos.mjs --mode full > /private/tmp/intentos-check-1.89.1.log 2>&1
npm run verify:release > /private/tmp/intentos-verify-release-1.89.1.log 2>&1
npm run verify > /private/tmp/intentos-verify-1.89.1.log 2>&1
git diff --check
```

Result:

- `node scripts/check-intentos.mjs --mode full`: pass
- `npm run verify:release`: pass
- `npm run verify`: pass
- `git diff --check`: pass
- Verify logs:
  - `/private/tmp/intentos-check-1.89.1.log`
  - `/private/tmp/intentos-verify-release-1.89.1.log`
  - `/private/tmp/intentos-verify-release-1.89.1-final.log`
  - `/private/tmp/intentos-verify-1.89.1.log`
