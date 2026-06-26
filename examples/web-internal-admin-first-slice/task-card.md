# Task 001: Admin Work Item List

## Task Level

L2

## Related Spec

`specs/001-admin-work-item-list.md`

## Related Eval

`evals/001-admin-work-item-list.md`

## Goal

Implement one narrow read-only internal-admin list slice for current-tenant work items.

## Scope

Allowed:

- add one admin list route or page
- add or reuse one trusted read-only data loader
- add local fixtures or tests for loading, empty, success, error, and forbidden states
- update verification only if needed for the new tests

Not allowed:

- create, edit, delete, archive, export, or bulk actions
- schema migration without explicit approval
- new dependency without explicit approval
- production config, secrets, or deployment changes
- broad navigation redesign or dashboard expansion

## Acceptance Criteria

- The route renders loading, empty, success, error, and forbidden states.
- The data loader applies tenant scope before returning rows.
- The UI has no write action.
- Relevant automated verification passes or the blocker is reported with evidence.

## Commands

Run:

```bash
scripts/verify.sh
```

If the project has web-specific checks, also run the existing lint, typecheck, test, and build commands.

## AI Budget

Max agent runs: 1
Max repair runs: 1
Use high reasoning model: No
Stop if: tenant scope, permission boundary, or route ownership is unclear.

## Risk Gate

This task touches:

- [ ] auth
- [x] permission
- [ ] migration
- [ ] regulated operation
- [ ] irreversible operation
- [ ] value transfer
- [ ] safety-critical behavior
- [ ] data deletion
- [ ] production config
- [ ] secrets
- [ ] personal data
- [ ] regulated data
- [ ] external side effect
- [ ] privileged operation
- [ ] app signing / platform release
- [ ] cloud function / access rule
- [ ] form interaction
- [ ] api failure
- [ ] accessibility
- [ ] performance
- [ ] dependency change

If any item is checked, implementation requires explicit human approval before code changes.

## Human Approval

Required: Yes
Status: Pending
Approval scope: Permission boundary only; no schema migration, production config, deployment, or data migration approved.
Approved by:
Approved at:
Approval notes: Permission boundary must be approved before implementation.

## Stop Conditions

Stop and report if:

- required spec/eval is missing or contradictory
- scope requires forbidden files
- same test fails twice
- production data/config/secrets are needed
- high-risk decision is required

## Final Report Required

- What changed
- What did not change
- Tests run
- Risks remaining
- Suggested next step
