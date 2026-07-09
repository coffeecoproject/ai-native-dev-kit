# Release 1.89.2: Approval Runtime Validation Hardening

## Summary

1.89.2 closes the remaining approval/apply-chain validation gaps found after
1.89.1.

This patch does not add a new workflow concept. It makes runtime apply
preconditions match the checker-strength approval rules.

## Changed Assets

- `scripts/lib/approval-record-validation.mjs`
- `scripts/lib/adoption-apply-chain.mjs`
- `scripts/check-approval-record.mjs`
- `scripts/check-intentos.mjs`
- `scripts/init-project.mjs`
- `schemas/artifacts/approval-record.schema.json`
- `package.json`
- `README.md`
- `README.zh-CN.md`
- `VERSION.md`
- `intentos-manifest.json`
- `templates/version-record.md`
- `templates/workflow-version.json`
- `releases/1.89.2/*`

## Allowed Claims

- `init-project --apply-plan` uses shared approval validation for specific
  human owner, parseable future expiry, risk exclusion, rollback/verification
  acknowledgement, action IDs, and target paths.
- `approved_action_ids` and `approved_action_paths` must match exactly; extra
  path rows are not accepted.
- Adoption apply-chain verification recomputes the apply plan `plan_digest`
  before returning `VERIFIED`.
- `check-approval-record --require-structured-evidence` fails closed when no
  approval records exist unless `--allow-empty` is explicit.

## Forbidden Claims

- 1.89.2 does not approve implementation.
- 1.89.2 does not approve native apply by itself.
- 1.89.2 does not approve commit, push, release, production, tests, migrations,
  provider actions, or project-owner decisions.
- A valid approval record is still only one controlled-apply precondition.

## Evidence Status

- Syntax checks include the shared approval validation helper.
- Self-check covers non-human owner, ambiguous owner, invalid expiry, extra
  path row, tampered plan digest, and forged apply-chain digest rejection.
- Existing 1.89.1 approval/apply-chain tests remain in force.

## Known Limitations

- 1.89.2 does not implement release identity/tag binding.
- 1.89.2 does not add Windows-specific raw backslash path fixtures.
- 1.89.2 does not add Work Queue over-40-source UI hardening.
- 1.89.2 does not pin GitHub workflow SHAs.
- 1.89.2 does not require approval records to live inside the target project;
  that remains a future audit-retention hardening item.

## Verification

Required verification:

```bash
npm run verify
git diff --check
```

Verification status is recorded in
[self-check-report.md](self-check-report.md).
