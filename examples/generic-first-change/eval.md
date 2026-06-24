# Eval: First Capability Slice

## Related Spec

`specs/001-first-capability-slice.md`

## Must Pass

- [ ] verification command runs
- [ ] relevant tests pass
- [ ] no unrelated files changed
- [ ] no unapproved dependency added

## Spec Alignment

- [ ] One narrow operation was implemented
- [ ] Non-goals were respected
- [ ] Result can be observed
- [ ] Invalid input is handled

## Permission / Data Checks

- [ ] No sensitive data is logged
- [ ] Resource/scope boundary is documented if applicable
- [ ] High-risk areas were not touched

## Manual Review Checklist

- Is this still one vertical slice?
- Did implementation avoid broad module setup?
- Does verification produce useful evidence?

## Reject Conditions

Reject if:

- implementation expands beyond first slice
- unapproved dependencies are added
- sensitive data is logged
- high-risk modules are modified without approval
- tests or verification are missing without explanation

## Required Evidence

- Command output summary
- Manual check notes if applicable

