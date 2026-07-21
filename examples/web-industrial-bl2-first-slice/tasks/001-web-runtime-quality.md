# Task 001: Web Runtime Quality Slice

## Task Level

L2

## Related Spec

`specs/001-web-runtime-quality.md`

## Related Eval

`evals/001-web-runtime-quality.md`

## Goal

Prepare one evidence-backed Web runtime quality slice for a protected browser flow.

## Scope

Allowed:

- define or implement one protected browser flow
- define or implement one filter form
- define or implement state coverage for loading, empty, success, error, forbidden, and recovery
- collect runtime, accessibility, performance, permission, and release evidence

Not allowed:

- production release
- production config change
- secrets
- dependency addition
- destructive action
- framework or hosting decision

## Acceptance Criteria

- The linked eval evidence terms are satisfied.
- The runtime evidence record is complete for this slice.
- The release record includes rollback, monitoring, and residual risk notes.
- No out-of-scope production, dependency, destructive, or framework change is introduced.

## Commands

Run:

```bash
scripts/verify.sh
```

Replace with project-specific lint, typecheck, test, build, browser, accessibility, or performance commands in a real project.

## AI Budget

Max agent runs: 1
Max repair runs: 1
Use high reasoning model: No
Stop if: permission boundary, evidence ownership, or release scope is unclear.

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
- [x] form interaction
- [x] api failure
- [x] accessibility
- [x] performance
- [ ] dependency change

Checked project-local technical risks require Codex to apply the corresponding verification controls. Human consent is required only if the task later introduces a concrete real-world effect.

## Human Approval

Required: No
Status: Not Required
Reason: This example performs only reversible project-local verification and has no production, paid, destructive, legal, or other real-world effect.

## Stop Conditions

Stop and report if:

- permission enforcement requires production credentials
- evidence refs cannot be made concrete
- task requires a new dependency or production config
- task expands beyond the first runtime quality slice

## Final Report Required

- What changed
- What did not change
- Tests or evidence recorded
- Risks remaining
- Suggested next step
