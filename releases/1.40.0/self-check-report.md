# Self-Check Report: 1.40.0

## Scope Check

- Protocol records explicit human approval evidence.
- Template requires action IDs, target paths, plan hash, expiry, rollback, verification, and non-authorizations.
- Checker rejects non-human approval, missing plan hash, blanket action approval, automatic apply, and high-risk actions.
- CLI only adds a check command.
- Generator creates draft records only.

## Governance Check

- Human approval remains human-owned.
- Approval records do not execute plans.
- Approval records do not override readiness, review loop, change boundary, hook policy, document lifecycle, or release governance.
- High-risk work remains outside Codex-controlled apply.

## Verification Notes

Run local verification before release:

```bash
node scripts/check-approval-record.mjs .
node scripts/check-approval-record.mjs examples/1.40-approval-record-governance
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
git diff --check
```
