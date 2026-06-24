# Eval: Admin Work Item List

## Related Spec

`specs/001-admin-work-item-list.md`

## Must Pass

- [ ] lint passes
- [ ] typecheck passes
- [ ] relevant tests pass
- [ ] build passes if applicable
- [ ] no unrelated files changed
- [ ] no unapproved dependency added

## Spec Alignment

- [ ] Implementation matches acceptance criteria
- [ ] Implementation respects non-goals
- [ ] API / interface contract matches spec
- [ ] UI states are covered if applicable
- [ ] observability requirements are covered if applicable

## Permission / Data Checks

- [ ] Permission checks are server-side where applicable
- [ ] Resource ownership is enforced
- [ ] Resource/scope isolation is enforced
- [ ] Error responses do not leak sensitive data

## Manual Review Checklist

- Open the admin list route locally.
- Verify success rows do not contain cross-tenant data.
- Verify forbidden state does not reveal row count.
- Verify no write actions are visible.

## Reject Conditions

Reject if:

- data can leak across tenants or authorized resource scopes
- permission checks only exist in frontend
- implementation modifies forbidden modules
- tests are missing for the tenant-scope behavior
- task added unapproved dependencies
- task violates non-goals

## Required Evidence

- Command output summary: include lint/typecheck/test/build result or project equivalent.
- Screenshots / traces if UI: include loading, empty, success, error, and forbidden states when browser UI exists.
- Review notes: include changed files, risk review, and any deferred follow-up.
