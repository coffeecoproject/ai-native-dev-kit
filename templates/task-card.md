# Task <number>: <task-name>

## Task Level

L0 / L1 / L2 / L3

## Related Spec

`specs/<file>.md`

## Related Eval

`evals/<file>.md`

## Goal

Implement one narrow change:

## Scope

Allowed:

- 

Not allowed:

- 

## Acceptance Criteria

- 

## Commands

Run:

```bash
scripts/verify.sh
```

## AI Budget

Max agent runs:
Max repair runs:
Use high reasoning model:
Stop if:

## Risk Gate

This task touches:

- [ ] auth
- [ ] permission
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

Required: No
Status: Not Required
Approval scope: Not Required
Approved by:
Approved at:
Approval notes:

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
