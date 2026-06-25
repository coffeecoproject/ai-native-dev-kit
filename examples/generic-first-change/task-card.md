# Task 001-1: Implement First Capability Operation

## Task Level

L1

## Related Spec

`specs/001-first-capability-slice.md`

## Related Eval

`evals/001-first-capability-slice.eval.md`

## Goal

Implement one narrow operation that proves the project can execute, verify, and review a complete change.

## Scope

Allowed:

- one entry point
- one operation handler
- related tests or verification
- minimal docs update

Not allowed:

- broad architecture rewrite
- external integration
- production deployment
- high-risk module change
- new dependency unless explicitly approved

## Acceptance Criteria

- Operation can be triggered.
- Result can be observed.
- Invalid input is handled.
- Verification runs.
- No unrelated files changed.

## Commands

Run:

```bash
scripts/verify.sh
```

## AI Budget

Max agent runs: 2
Max repair runs: 1
Use high reasoning model: no
Stop if: stack or verification command is unclear

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

- stack-specific verification is undefined
- implementation requires external systems
- implementation requires production data or config
- same test fails twice

## Final Report Required

- What changed
- What did not change
- Tests run
- Risks remaining
- Suggested next step
