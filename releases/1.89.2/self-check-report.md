# Release 1.89.2 Self-Check Report

## Scope

Approval Runtime Validation Hardening.

## Checks

- Shared approval validation helper syntax is checked by `verify:syntax`.
- `init-project --apply-plan` rejects non-human approval owners.
- `init-project --apply-plan` rejects ambiguous approval owners.
- `init-project --apply-plan` rejects unparseable approval expiry.
- `init-project --apply-plan` rejects extra `approved_action_paths` rows.
- Adoption Assurance apply-chain helper rejects forged apply-plan digest.
- `check-approval-record --require-structured-evidence` fails closed when no
  records exist unless `--allow-empty` is explicit.

## Boundaries

- No implementation authorization added.
- No native apply authorization added by this patch alone.
- No release or production authorization added.
- No project-owner decision replacement added.

## Final Verification

Executed in this working tree:

```bash
node scripts/check-intentos.mjs --mode full > /private/tmp/intentos-check-1.89.2.log 2>&1
npm run verify:release > /private/tmp/intentos-verify-release-1.89.2.log 2>&1
npm run verify
git diff --check
```

Result:

- `node scripts/check-intentos.mjs --mode full`: PASS
- Full self-check log: `/private/tmp/intentos-check-1.89.2.log`
- `npm run verify:release`: PASS
- Release verify log: `/private/tmp/intentos-verify-release-1.89.2.log`
- `npm run verify`: PASS
- Verify log: `/private/tmp/intentos-verify-1.89.2.log`
- `git diff --check`: PASS
