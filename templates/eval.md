# Eval: <feature-name>

## Related Spec

`specs/<file>.md`

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

- 

## Reject Conditions

Reject if:

- data can leak across users or authorized resource scopes
- permission checks only exist in frontend
- implementation modifies forbidden modules
- tests are missing for the highest-risk behavior
- task added unapproved dependencies
- task violates non-goals

## Required Evidence

- Command output summary:
- Screenshots / traces if UI:
- Review notes:
